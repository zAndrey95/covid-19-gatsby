import React from 'react';
import Helmet from 'react-helmet';
import axios from 'axios';
import L from 'leaflet';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';


const LOCATION = {
  lat: 0,
  lng: 0
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;


const IndexPage = () => {
  async function mapEffect({ leafletElement: map } = {}) {
    let response;

    try {
      response = await axios.get('https://corona.lmao.ninja/v2/countries');
    } catch(e) {
      console.log(`Failed to fetch countries: ${e.message}`, e);
      return;
    }

    const { data = {} } = response;
    const hasData = Array.isArray(data) && data.length > 0;

    if (!hasData) return;

    const geoJson = {
      type: 'FeaturedColletion',
      features: data.map((country = {}) => {
        const { countryInfo = {} } = country;
        const { lat, long: lng } = countryInfo;
        return {
          type: 'Feature',
          properties: {
            ...country,
          },
          geometry: {
            type: 'Point',
            coordinates: [ lng, lat ]
          }
        }
      })
    }

    const geoJsonLayers = new L.GeoJSON(geoJson, {
      pointToLayer: (feature = {}, latlng) => {
        const { properties = {} } = feature;
        let updatedFormatted;
        let casesString;
  
        const {
          country,
          updated,
          cases,
          deaths,
          recovered
        } = properties;
  
        casesString = `${cases}`;
  
        if(cases > 1000) {
          casesString = `${casesString.slice(0, -3)}k+`
        }
  
        if(updated) {
          updatedFormatted = new Date(updated).toLocaleString();
        }
  
        const html = `
          <span class="icon-marker">
            <span class="icon-marker-tooltip">
              <h2>${country}</h2>
              <ul>
                <li><strong>Confirmed: </strong> ${cases}</li>
                <li><strong>Death: </strong> ${deaths}</li>
                <li><strong>Recovered: </strong> ${recovered}</li>
                <li><strong>Last Update: </strong> ${updatedFormatted}</li>
              </ul>
            </span>
            ${casesString}
          </span>
        `;
  
        return L.marker( latlng, {
          icon: L.divIcon({
            className: 'icon',
            html
          }),
          riseOnHover: true
        });
      }
    })
  
    geoJsonLayers.addTo(map);
  }

  

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings} />

      <Container type="content" className="text-center home-start"/>
    </Layout>
  );
};

export default IndexPage;