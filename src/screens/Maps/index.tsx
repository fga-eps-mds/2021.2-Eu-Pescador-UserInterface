import React, { useState } from 'react';
import { LocationUsageInfoContainer, LocationUsageInfoText, LocationUsageInfoTitle, LocationUsageInfoView, Map, MapButtonsView, MapContainer, MapInfoView, MapInstructions, MapInstructionsText } from './styles';
import { Marker, MapEvent, LatLng, MarkerAnimated } from 'react-native-maps';
import { DefaultButton } from '../../components/Button';
import { Platform } from 'expo-modules-core';

export const MyMap = ({ navigation, route }: any) => {
    const [mark, setMark] = useState<LatLng>({ latitude: route.params.latitude, longitude: route.params.longitude });

    const handleDrag = (e: MapEvent) => {
        setMark({latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude});
    }

    const handleConfirm = (latitude: number, longitude: number) => {
        route.params.latitude = latitude;
        route.params.longitude = longitude;
        const params = {
            data: route.params,
            isNewRegister: route.params.isNew,
            log_id: route.params.log_id,
            name: route.params.screenName
        };
        navigation.navigate("NewFishLog", { ...params })
    }
    return (
        <MapContainer >
            <Map
                initialRegion={{
                    latitude: route.params.latitude,
                    longitude: route.params.longitude,
                    latitudeDelta: 0.0322,
                    longitudeDelta: 0.0121,
                }}
                onPress={(e: MapEvent) => {e.stopPropagation(); handleDrag(e);}}
            >
                <Marker coordinate={mark} />
            </Map>
            <MapInstructions>
                <MapInstructionsText>Clique no mapa para marcar o local onde pegou o peixe</MapInstructionsText>
            </MapInstructions>
            <LocationUsageInfoView>
                <LocationUsageInfoContainer>
                    <LocationUsageInfoTitle>Por que precisamos da localização?</LocationUsageInfoTitle>
                    <LocationUsageInfoText>A localização enviada será utilizada pelas unidades ambientais responsáveis para mapear a posição das espécies</LocationUsageInfoText>
                </LocationUsageInfoContainer>
                <MapButtonsView>
                    <DefaultButton type="secondary" text="Cancelar" buttonFunction={() => { navigation.goBack() }} />
                    <DefaultButton text="Confirmar" buttonFunction={() => handleConfirm(mark.latitude, mark.longitude)} />
                </MapButtonsView>
            </LocationUsageInfoView>
        </MapContainer>
    )
}