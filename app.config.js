
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
                    apiKey: 'AIzaSyBwvb4qyMjqj_mvY-wmsIuM52fwFAAJvXE'
                }
            }
        },
    };
};
