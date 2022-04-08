import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import {CheckBox} from 'react-native-elements';
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
} from './styles';
import { GetAllFishLogs } from '../../services/fishLogService/getAllLogs';
import { ExportFishLogs } from '../../services/fishLogService/exportFishLogs';
import { FishLogCard, IFishLog } from '../FishLogCard';
import { DraftButton } from '../DraftButton';
import { FilterButton } from '../FilterButton';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface Props {
  token: string;
  isAdmin: boolean;
  navigation: any;
  filterQuery: any;
}

export const FishLogs = (
  { token,
    navigation,
    filterQuery,
    isAdmin,
  }: Props
) => {
  const [fishLog, setFishLog] = useState<IFishLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportList, setExportList] = useState<string[]>([]);
  const [isCheck, setIsCheck] = useState(false);
  const [isExportMode, setIsExportMode] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);


  const getFishLogs = async () => {
    setIsLoading(true);

    try {
      const data = await GetAllFishLogs(token, filterQuery);
      setFishLog(data.reverse());
    } catch (error: any) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const getDrafts = async () => {
    setIsLoading(true);
    const drafts = await AsyncStorage.getItem('drafts');
    if (drafts)
      setHasDraft(drafts != '[]');
  }

  const handleNavigation = (id: string) => {
    navigation.navigate(
      'FishLog' as never,
      {
        log_id: id,
      } as never,
    );
  };

  const selectAllFunction = (value: boolean) => {
    setIsCheck(value);
    if (value) {
      fishLog.forEach((item) => {
        if (!exportList.includes(item.id)) {
          setExportList(arr => [...arr, item.id]);
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
    navigation.navigate("NewFishLog" as never, {
      isNewRegister: true,
      name: "Novo Registro",
    } as never);
  };


  const saveFile = async (csvFile: string) => {
    setIsLoading(true);
    try {
      const res = await MediaLibrary.requestPermissionsAsync()

      if (res.granted) {
        let today = new Date();
        let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getHours() + "-" + today.getMinutes();

        let fileUri = FileSystem.documentDirectory + `registros-${date}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csvFile);
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync("euPescador", asset, false);

        handleExport();
        Alert.alert("Exportar Registros", "Registros exportados com sucesso. Você pode encontrar o arquivo em /Pictures/euPescador", [
          {
            text: "Ok",
          }
        ])
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Exportar Registros", "Falha ao exportar registros", [
        {
          text: "Ok",
        }
      ])
    }
    setIsLoading(false);
  };

  const handleExportSelected = async () => {
    try {
      console.log(exportList);
      const file: any = await ExportFishLogs(token, exportList);
      saveFile(file);
    } catch (error: any) {
      console.log(error);
      Alert.alert("Exportar Registros", "Falha ao exportar registros", [
        {
          text: "Ok",
        }
      ])
    }
  };


  const addExportList = (logId: string) => {
    setExportList(arr => [...arr, logId]);
  };

  const removeExportList = (logId: string) => {
    setExportList(exportList.filter(item => item !== logId));
  };

  useEffect(() => {
    getFishLogs();
    getDrafts();
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
              screen='LogFilter'
            />

            {
              isAdmin ? (
                <ButtonView>
                  <ExportButton onPress={handleExport}>
                    {
                      isExportMode ? <>
                        <DownloadIcon name="cancel" />
                        <CancelButtonText >Cancelar</CancelButtonText>
                      </>

                        :
                        <>
                          <DownloadIcon name="file-download" />
                          <ExportButtonText>Exportar Registros</ExportButtonText>
                        </>

                    }
                  </ExportButton>
                </ButtonView>
              ) : <ButtonView>
                <ExportButton onPress={handleAddLog}>
                <DownloadIcon name="add" />
                          <ExportButtonText>Criar Novo Registro</ExportButtonText>
                </ExportButton>
              </ButtonView>
            }
          </OptionsView>
          <ExportAllView>
            {
              isExportMode ? <>
                {/* <CheckBox value={isCheck} onValueChange={selectAllFunction} /> */}
                <CheckBox
                  checked={isCheck}
                  onPress={() => selectAllFunction(!isCheck)}
                  checkedColor={'#00BBD4'}
                  uncheckedColor={"black"}
                />
                <ExportAllText>Selecionar todos os registros</ExportAllText>
              </>
                : null
            }
          </ExportAllView>
          {hasDraft ?
            <DraftButton /> :
            null
          }
          
          {
            fishLog.length ? (
              <FishCardList
                data={fishLog}
                renderItem={({ item }) => (
                  <FishLogCard
                    selectAll={isCheck}
                    fishLog={item}
                    isHidden={!isExportMode}
                    cardFunction={() => {
                      handleNavigation(item.id);
                    }}
                    selectFunction={() => {
                      addExportList(item.id);
                    }}
                    deselectFunction={() => {
                      removeExportList(item.id);
                    }}
                  />
                )}
                keyExtractor={item => item.id}
              />
            ) : (
              filterQuery ? (

                <NoResultContainer>
                  <SearchImage source={require('../../assets/search.png')} />
                  <BoldText>Não encontramos nada com os filtros utilizados</BoldText>
                  <RegularText>
                    Por favor, verifique sua pesquisa e tente novamente para obter
                    resultados.
                  </RegularText>
                </NoResultContainer>

              ) : null
            )
          }

          {isExportMode ?
            <ExportSelectedView>
              <ExportSelectedButton disabled={!exportList.length} onPress={() => {
                Alert.alert("Exportar Registros", "Você deseja exportar esses registros?", [
                  {
                    text: "Cancelar",
                    style: "cancel"
                  },
                  {
                    text: "Ok",
                    onPress: () => handleExportSelected()
                  }
                ])
              }
              }>
                <ExportSelectedButtonView>
                  <ExportSelectedText>Exportar Selecionados</ExportSelectedText>
                  <DownloadIconBottom name="file-download" />
                </ExportSelectedButtonView>
              </ExportSelectedButton>
            </ExportSelectedView>
            : <AddButtonView>
              <AddLogButton onPress={handleAddLog}>
                <AddLogView>
                  <AddIcon name="add" />
                </AddLogView>
              </AddLogButton>
            </AddButtonView>
          }
        </>
      )
      }
    </Container >
  );
};