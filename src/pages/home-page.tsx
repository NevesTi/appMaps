import React, { useState, useEffect, useRef, } from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as Permission from 'expo-permissions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import config from './config/index.json';
import MapViewDirections from 'react-native-maps-directions';


export default function HomePage() {
  const mapEl = useRef(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [distace, setDistance] = useState(null);

  useEffect(() => {
    (async function () {
      const { status, permissions } = await Permission.askAsync(Permission.LOCATION);
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
        setOrigin({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        })
      } else {
        throw new Error('Location permission not granted');
      }
    })();
  }, []);


  return (
    <View style={styles.container}>
      <MapView style={styles.map}
        initialRegion={origin}
        showsUserLocation={true}
        zoomEnabled={false}
        loadingEnabled={true}
        ref={mapEl}
      >
        {destination &&
          <MapViewDirections /* Se o usuário digitar um destino ele entra MapViewDirections traçando a rota digitada.  */
            origin={origin}
            destination={destination}
            apikey={config.googleApi}
            strokeWidth={3} /**tamanho da borda de pesquisa */
            onReady={result => {
              setDistance(result.distance) /**Calculando a distanca */
              mapEl.current.fitToCoordinates(
                result.coordinates, {
                edgePaddig: {
                  top: 50,
                  bootom: 50,
                  left: 50,
                  right: 50,
                }
              }
              )
            }}
          />
        }
      </MapView>

      <View style={styles.search}>

        <GooglePlacesAutocomplete /*Busca o endereço de destino e foi passado a chave da api em KEY */
          placeholder='Para onde vamos?'
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            setDestination({
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              latitudeDelta: 0.000922,
              longitudeDelta: 0.000421
            });
            console.log(destination);
          }}
          query={{
            key: config.googleApi,
            language: 'pt-br',
          }}
          enablePoweredByContainer={false}
          fetchDetails={true}
          styles={{ listView: { height: 100 } }}
        />


        {distace &&
          <View style={styles.distance}>
            <Text style={styles.distance_text}>Distância: {distace.toFixed(2).replace('.' , ',')} km</Text>
          </View>

        }
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    height: '80%'
  },
  search: {
    height: '20%'
  },

  distance: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  distance_text: {
    fontSize:20,
    fontWeight:'700',
  }

});
