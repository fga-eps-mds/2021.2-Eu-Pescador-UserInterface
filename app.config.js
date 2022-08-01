
export default ({ config }) => {
    return {
        ...config,
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#FFFFFF"
            },
            package: "com.eupescador.app",
            config: {
                googleMaps: {
                    apiKey: 'AIzaSyD_yle921eRcWoK8Z8ifjK6hcqGRY9B9-k'
                }
            }
        },
    };
};
