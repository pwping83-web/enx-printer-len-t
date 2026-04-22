/// <reference types="vite/client" />

// 카카오 지도 API 타입 정의
declare global {
  interface Window {
    kakao: {
      maps: {
        services: {
          Geocoder: new () => {
            addressSearch: (
              address: string,
              callback: (result: any[], status: string) => void
            ) => void;
            coord2Address: (
              longitude: number,
              latitude: number,
              callback: (result: any[], status: string) => void
            ) => void;
          };
          Status: {
            OK: string;
            ZERO_RESULT: string;
            ERROR: string;
          };
        };
        LatLng: new (latitude: number, longitude: number) => any;
        Map: new (container: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        load: (callback: () => void) => void;
      };
    };
  }
}

export {};
