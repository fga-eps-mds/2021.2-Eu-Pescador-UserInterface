import React, { useState, useEffect } from "react";
import { ScrollView, Alert, ActivityIndicator } from "react-native";
import { CommonActions } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import NetInfo from "@react-native-community/netinfo";
import {
  FishContainer,
  PropertyRow,
  DescriptionContainer,
  RegisterButtonView,
} from "./styles";
import { View, StyleSheet } from 'react-native';
import { Property } from "../../components/Property";
import { Title } from "../../components/Title";
import { HalfToneText } from "../../components/HalfToneText";
import { ProfileImage } from "../../components/ProfileImage";
import { MapViewImage } from "../../components/MapViewImage";
import { DefaultButton } from "../../components/Button";

import { GetOneFishLog } from "../../services/fishLogService/getOneFishLog";
import { DeleteFishLog } from "../../services/fishLogService/deleteFishLog";
import { ExportFishLogs } from "../../services/fishLogService/exportFishLogs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NoFishImagePhoto } from "../../components/NoFishImagePhoto";
import MapView, { Marker } from "react-native-maps";

export const FishLog = ({ navigation, route }: any) => {
  const [fishName, setFishName] = useState();
  const [fishPhoto, setFishPhoto] = useState<string>();
  const [fishLargeGroup, setFishLargeGroup] = useState();
  const [fishGroup, setFishGroup] = useState();
  const [lat, setLat] = useState();
  const [lng, setLng] = useState();
  const [fishSpecies, setFishSpecies] = useState();
  const [fishWeight, setFishWeight] = useState<number>();
  const [fishLength, setFishLength] = useState<number>();
  const [isAdmin, setIsAdmin] = useState<boolean>();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>();
  const [isLoading, setIsLoading] = useState(true);
  const [logId, setLogId] = useState("");
  const [isReviewed, setIsReviewed] = useState(false);
  const [userToken, setUserToken] = useState("");
  const [mapRegion, setmapRegion] = useState({
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const connection = NetInfo.useNetInfo();

  const getData = async () => {
    const userAdmin = await AsyncStorage.getItem("@eupescador/userAdmin");
    const userSuperAdmin = await AsyncStorage.getItem(
      "@eupescador/userSuperAdmin"
    );
    const token = await AsyncStorage.getItem("@eupescador/token");
    if (token) {
      getFishLogProperties(token);
      setUserToken(token);
    }
    if (userAdmin === "true") {
      setIsAdmin(true);
      setIsSuperAdmin(false);
    } else if (userSuperAdmin === "true") {
      setIsAdmin(false);
      setIsSuperAdmin(true);
    } else {
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  };

  const handleDelete = async () => {
    try {
      await DeleteFishLog(userToken, logId);
      const resetAction = CommonActions.reset({
        index: 0,
        routes: [{ name: "WikiFishlogs" }],
      });
      navigation.dispatch(resetAction);
    } catch (error) {
      console.log(error);
    }
  };

  const saveFile = async (txtFile: string) => {
    setIsLoading(true);
    try {
      const res = await MediaLibrary.requestPermissionsAsync();

      if (res.granted) {
        let today = new Date();
        let date =
          today.getFullYear() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getDate() +
          "-" +
          today.getHours() +
          "-" +
          today.getMinutes();

        let fileUri = FileSystem.documentDirectory + `registros-${date}.txt`;
        await FileSystem.writeAsStringAsync(fileUri, txtFile, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync("euPescador", asset, false);

        Alert.alert(
          "Exportar Registro",
          "Registro exportado com sucesso. Você pode encontrar o arquivo em /Pictures/euPescador",
          [
            {
              text: "Ok",
            },
          ]
        );
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Exportar Registro", "Falha ao exportar registro", [
        {
          text: "Ok",
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleExportFishlog = async () => {
    setIsLoading(true);
    try {
      const file: any = await ExportFishLogs(userToken, [logId]);
      saveFile(file);
    } catch (error: any) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const getFishLogProperties = async (token: string) => {
    setIsLoading(true);

    let log;
    try {
      if (connection.isConnected) {
        const { log_id } = route.params;
        setLogId(log_id);
        log = await GetOneFishLog(log_id, token);
      } else {
        const { fish } = route.params;
        log = fish;
      }
      if (log?.photo) {
        const base64Img = `data:image/png;base64,${log.photo}`;
        setFishPhoto(base64Img);
      }
      setLat(log?.coordenates.latitude);
      setLng(log?.coordenates.longitude);
      setFishName(log?.name);
      setFishSpecies(log?.species);
      setFishLargeGroup(log?.largeGroup);
      setFishGroup(log?.group);
      setFishWeight(log?.weight);
      setFishLength(log?.length);
      setIsReviewed(log?.reviewed);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getData();
  }, [userToken]);

  return (
    <FishContainer>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {fishPhoto ? (
            <ProfileImage source={{ uri: fishPhoto }} />
          ) : (
            <NoFishImagePhoto />
          )}
          <DescriptionContainer>
            <Title text={fishName ? fishName : "Nome não informado"} />
            <HalfToneText
              text={fishSpecies ? fishSpecies : "Espécie não informado"}
            />
          </DescriptionContainer>

          <PropertyRow>
            <Property
              property="Grande Grupo"
              value={fishLargeGroup ? fishLargeGroup : "Não informado"}
            />

            <Property
              property="Grupo"
              value={fishGroup ? fishGroup : "Não informado"}
            />
          </PropertyRow>

          <PropertyRow>
            <Property
              property="Tamanho(cm)"
              value={fishLength ? fishLength.toString() : "Não informado"}
            />

            <Property
              property="Peso(kg)"
              value={fishWeight ? fishWeight.toString() : "Não informado"}
            />
          </PropertyRow>
          {lat || lng !== null ?   <MapView
        style={{ alignSelf: 'stretch', height: 200, margin: 20 }}
        initialRegion={{
          latitude: lat  !== null ? lat : 0.0,
          longitude:  lng !== null ? lng : 0.0,
        }}
      >
           <Marker
            coordinate={{latitude: lat !== null ? lat : 0.0,
            longitude: lng !== null ? lng : 0.0}}
            title={FishName}
            description={FishGroup}
         />
      </MapView> : null}
        
          {connection.isConnected ? (
            <RegisterButtonView>
              {isAdmin || isSuperAdmin ? (
                <>
                  <DefaultButton
                    text="Revisar"
                    buttonFunction={() => {
                      navigation.navigate(
                        "NewFishLog" as never,
                        {
                          isNewRegister: false,
                          log_id: logId,
                          name: "Revisar Registro",
                        } as never
                      );
                    }}
                  />
                  <DefaultButton
                    text="Exportar"
                    buttonFunction={() => {
                      Alert.alert(
                        "Exportar Registro",
                        "Você deseja exportar este registro?",
                        [
                          {
                            text: "Cancelar",
                            style: "cancel",
                          },
                          {
                            text: "Ok",
                            onPress: () => handleExportFishlog(),
                          },
                        ]
                      );
                    }}
                  />
                </>
              ) : (
                <DefaultButton
                  text="Editar"
                  buttonFunction={() => {
                    if (isReviewed) {
                      Alert.alert(
                        "Registro",
                        "Não é possível editar esse registro pois ele já foi revisado por um pesquisador.",
                        [
                          {
                            text: "Ok",
                          },
                        ]
                      );
                    } else {
                      navigation.navigate(
                        "NewFishLog" as never,
                        {
                          isNewRegister: false,
                          log_id: logId,
                          name: "Editar Registro",
                        } as never
                      );
                    }
                  }}
                />
              )}

              <DefaultButton
                text="Excluir"
                buttonFunction={() => {
                  if (isReviewed) {
                    Alert.alert(
                      "Excluir Registro",
                      "Não é possível deletar esse registro pois ele já foi revisado por um pesquisador.",
                      [
                        {
                          text: "Ok",
                        },
                      ]
                    );
                  } else {
                    Alert.alert(
                      "Excluir Registro",
                      "Você tem certeza que deseja excluir este registro?",
                      [
                        {
                          text: "Cancelar",
                          style: "cancel",
                        },
                        {
                          text: "Ok",
                          onPress: () => handleDelete(),
                        },
                      ]
                    );
                  }
                }}
              />
            </RegisterButtonView>
          ) : null}
        </ScrollView>
      )}
    </FishContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});