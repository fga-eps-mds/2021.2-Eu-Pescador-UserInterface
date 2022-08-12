import React, { useEffect, useState } from "react";
import { Marker } from "react-native-maps";
import { Map, MapContainer } from "./styles";
import { GetAllFishLogs } from "../../services/fishLogService/getAllLogs";
import { IFishLog } from "../../components/FishLogCard";
import { Container } from "./styles";
import { Imagem } from "./styles";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LogsMap = ({
  latitude,
  longitude,
  latitudeDelta,
  longitudeDelta,
  token,
  navigation,
  isAdmin,
  filterQuery,
}: any) => {
  const [fishLogs, setFishLogs] = useState<IFishLog[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  async function updateFishLogs() {
    const data = await GetAllFishLogs(token, filterQuery);
    setFishLogs(data as IFishLog[]);
    const userSuperAdmin = await AsyncStorage.getItem(
      "@eupescador/userSuperAdmin"
    );
    if (userSuperAdmin === "true") {
      setIsSuperAdmin(true);
    }
  }

  useEffect(() => {
    updateFishLogs();
  }, []);
  return (
    <Container>
      <MapContainer>
        <Map
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta,
          }}
          maxZoomLevel={14.8}
        >
          {fishLogs.map((res) => {
            if (res.reviewed) {
              return (
                <Marker
                  coordinate={{
                    latitude:
                      res.coordenates.latitude !== null
                        ? res.coordenates.latitude
                        : 0.0,
                    longitude:
                      res.coordenates.longitude !== null
                        ? res.coordenates.longitude
                        : 0.0,
                  }}
                  title={res.name}
                  description={res.group}
                />
              );
            }
          })}
        </Map>
      </MapContainer>
    </Container>
  );
};
