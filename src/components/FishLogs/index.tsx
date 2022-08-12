import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import { CheckBox } from "react-native-elements";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import {
  ButtonView,
  Container,
  ExportButton,
  ExportButtonText,
  DownloadIcon,
  AddLogButton,
  AddIcon,
  AddLogView,
  AddButtonView,
  TouchableTitle,
  OptionsView,
  FishCardList,
  ExportAllView,
  ExportAllText,
  CancelButtonText,
  ExportSelectedView,
  ExportSelectedButton,
  ExportSelectedButtonView,
  DownloadIconBottom,
  ExportSelectedText,
  NoResultContainer,
  SearchImage,
  BoldText,
  RegularText,
} from "./styles";
import { GetAllFishLogs } from "../../services/fishLogService/getAllLogs";
import { ExportFishLogs } from "../../services/fishLogService/exportFishLogs";
import { FishLogCard, IFishLog } from "../FishLogCard";
import { DraftButton } from "../DraftButton";
import { FilterButton } from "../FilterButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  token: string;
  isAdmin: boolean;
  navigation: any;
  filterQuery: any;
}

export const FishLogs = ({
  token,
  navigation,
  filterQuery,
  isAdmin,
}: Props) => {
  const [fishLog, setFishLog] = useState<IFishLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportList, setExportList] = useState<string[]>([]);
  const [isCheck, setIsCheck] = useState(false);
  const [isExportMode, setIsExportMode] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const { StorageAccessFramework } = FileSystem;

  const loadFishesLogsOffline = async () => {
    let allFishesLogs = await AsyncStorage.getItem("@eupescador/allFishesLogs");
    if (allFishesLogs) {
      let fishesLogs = JSON.parse(allFishesLogs);

      const newFishesLogs = await AsyncStorage.getItem("@eupescador/newfish");

      if (newFishesLogs) {
        let fishesUnSave = [];
        fishesUnSave = JSON.parse(newFishesLogs);

        for (let i = 0; i < fishesUnSave.length; i++) {
          fishesLogs.push(fishesUnSave[i]);
        }
      }
      setFishLog(fishesLogs.reverse());
    }
  };

  const getFishLogs = async () => {
    setIsLoading(true);

    try {
      let data = await GetAllFishLogs(token, filterQuery);
      const offlineRegisterArray = await AsyncStorage.getItem(
        "@eupescador/newfish"
      );
      let fishesInCache = [];
      if (offlineRegisterArray) {
        fishesInCache = JSON.parse(offlineRegisterArray);

        for (let i = 0; i < fishesInCache.length; i++) {
          data.push(fishesInCache[i]);
        }
      }
      await AsyncStorage.setItem(
        "@eupescador/allFishesLogs",
        JSON.stringify(data)
      );
      setFishLog(data.reverse());
    } catch (error: any) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const getDrafts = async () => {
    setIsLoading(true);
    const drafts = await AsyncStorage.getItem("drafts");
    if (drafts) setHasDraft(drafts != "[]");
  };

  const handleNavigationOnline = (id: string) => {
    navigation.navigate(
      "FishLog" as never,
      {
        log_id: id,
      } as never
    );
  };

  const handleNavigationOffline = (fish: IFishLog) => {
    navigation.navigate(
      "FishLog" as never,
      {
        fish,
      } as never
    );
  };

  const selectAllFunction = (value: boolean) => {
    setIsCheck(value);
    if (value) {
      fishLog.forEach((item) => {
        if (!exportList.includes(item.id)) {
          setExportList((arr) => [...arr, item.id]);
        }
      });
    } else {
      setExportList([]);
    }
  };

  const handleExport = async () => {
    setIsExportMode(!isExportMode);
  };

  const handleAddLog = async () => {
    navigation.navigate(
      "NewFishLog" as never,
      {
        isNewRegister: true,
        name: "Novo Registro",
      } as never
    );
  };

  const saveFile = async (csvFile: string) => {
    setIsLoading(true);
    try {
      const res =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();

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
        let filename = `registros-${date}.txt`;
        let directoryUri = res.directoryUri;
        await StorageAccessFramework.createFileAsync(
          directoryUri,
          filename,
          "application/txt"
        )
          .then(async (fileUri) => {
            await FileSystem.writeAsStringAsync(fileUri, csvFile, {
              encoding: FileSystem.EncodingType.UTF8,
            });
          })
          .catch((e) => {
            console.log(e);
          });

        handleExport();
        Alert.alert(
          "Exportar Registros",
          "Registro(s) exportado(s) com sucesso!",
          [
            {
              text: "Ok",
            },
          ]
        );
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Exportar Registros", "Falha ao exportar registro(s)!", [
        {
          text: "Ok",
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleExportSelected = async () => {
    try {
      const file: any = await ExportFishLogs(token, exportList);
      saveFile(file);
      setExportList([]);
    } catch (error: any) {
      console.log(error);
      Alert.alert("Exportar Registros", "Falha ao exportar registros", [
        {
          text: "Ok",
        },
      ]);
    }
  };

  const addExportList = (logId: string) => {
    setExportList((arr) => [...arr, logId]);
  };

  const removeExportList = (logId: string) => {
    setExportList(exportList.filter((item) => item !== logId));
  };

  useEffect(() => {
    async function isOnline() {
      const con = await NetInfo.fetch();

      if (con.isConnected) {
        getFishLogs();
        getDrafts();
      } else {
        setIsLoading(false);
        loadFishesLogsOffline();
      }
    }

    isOnline();
  }, []);

  return (
    <Container>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <OptionsView>
            <FilterButton
              url={filterQuery}
              navigation={navigation}
              screen="LogFilter"
            />
            {isAdmin ? (
              <ButtonView>
                <ExportButton onPress={handleExport}>
                  {isExportMode ? (
                    <>
                      <DownloadIcon name="cancel" />
                      <CancelButtonText>Cancelar</CancelButtonText>
                    </>
                  ) : (
                    <>
                      <DownloadIcon name="file-download" />
                      <ExportButtonText>Exportar Registros</ExportButtonText>
                    </>
                  )}
                </ExportButton>
              </ButtonView>
            ) : (
              <ButtonView>
                <ExportButton onPress={handleAddLog}>
                  <DownloadIcon name="add" />
                  <ExportButtonText>Criar Novo Registro</ExportButtonText>
                </ExportButton>
              </ButtonView>
            )}
          </OptionsView>
          <ExportAllView>
            {isExportMode ? (
              <>
                {/* <CheckBox value={isCheck} onValueChange={selectAllFunction} /> */}
                <CheckBox
                  checked={isCheck}
                  onPress={() => selectAllFunction(!isCheck)}
                  checkedColor={"#00BBD4"}
                  uncheckedColor={"black"}
                />
                <ExportAllText>Selecionar todos os registros</ExportAllText>
              </>
            ) : null}
          </ExportAllView>
          {hasDraft ? <DraftButton /> : null}

          {fishLog.length ? (
            <FishCardList
              data={fishLog}
              renderItem={({ item }) => (
                <FishLogCard
                  selectAll={isCheck}
                  fishLog={item}
                  isHidden={!isExportMode}
                  cardFunction={async () => {
                    await NetInfo.fetch().then((status) => {
                      if (status.isConnected) {
                        handleNavigationOnline(item.id);
                      } else {
                        handleNavigationOffline(item);
                      }
                    });
                  }}
                  selectFunction={() => {
                    addExportList(item.id);
                  }}
                  deselectFunction={() => {
                    removeExportList(item.id);
                  }}
                />
              )}
              keyExtractor={(item) => item.id}
            />
          ) : filterQuery ? (
            <NoResultContainer>
              <SearchImage source={require("../../assets/search.png")} />
              <BoldText>
                Não encontramos nada com os filtros utilizados
              </BoldText>
              <RegularText>
                Por favor, verifique sua pesquisa e tente novamente para obter
                resultados.
              </RegularText>
            </NoResultContainer>
          ) : null}

          {isExportMode ? (
            <ExportSelectedView>
              <ExportSelectedButton
                disabled={!exportList.length}
                onPress={() => {
                  Alert.alert(
                    "Exportar Registros",
                    "Você deseja exportar esses registros?",
                    [
                      {
                        text: "Cancelar",
                        style: "cancel",
                      },
                      {
                        text: "Ok",
                        onPress: () => handleExportSelected(),
                      },
                    ]
                  );
                }}
              >
                <ExportSelectedButtonView>
                  <ExportSelectedText>Exportar Selecionados</ExportSelectedText>
                  <DownloadIconBottom name="file-download" />
                </ExportSelectedButtonView>
              </ExportSelectedButton>
            </ExportSelectedView>
          ) : (
            <AddButtonView>
              <AddLogButton onPress={handleAddLog}>
                <AddLogView>
                  <AddIcon name="add" />
                </AddLogView>
              </AddLogButton>
            </AddButtonView>
          )}
        </>
      )}
    </Container>
  );
};
