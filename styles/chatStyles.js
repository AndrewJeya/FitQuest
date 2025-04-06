import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        padding: 10,
        paddingTop: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingBottom: 20,
    },
    trainerMessage: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        fontSize: 16,
    },
    userMessage: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        marginBottom: 20,
        fontSize: 16,
    },
    profilePic: {
        width: 30,
        height: 30,
        borderRadius: 20,
        marginRight: 10,
    },
    trainerBubble: {
        padding: 15,
        maxWidth: '85%',
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    userBubble: {
        backgroundColor: '#03C988',
        padding: 10,
        borderRadius: 10,
        maxWidth: '80%',
        marginRight: 10,
    },
    trainerText: {
        color: '#fff',
        fontSize: 16,
    },
    userText: {
        color: '#fff',
        fontSize: 16,
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 10,
        marginLeft: 50,
    },
    video: {
        flex: 1,
        borderRadius: 10,
    },
    capturedImage: {
        width: 250,
        height: 150,
        borderRadius: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 5,
        paddingVertical: 5,
        backgroundColor: 'rgba(36, 40, 47, 0.6)',
        borderRadius: 10,
        marginHorizontal: 5,
        marginBottom: 20,
    },
    cameraButton: {
        marginHorizontal: 5,
        marginVertical: 5,
    },
    cameraIcon: {
        width: 24,
        height: 24,
    },
    input: {
        flex: 1,
        padding: 10,
        borderRadius: 20,
        color: '#fff',
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#03C988',
        padding: 10,
        borderRadius: 10,
        marginLeft: 10,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    topNavContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 65,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    backButton: {
        padding: 10,
    },
    backIcon: {
        width: 28,
        height: 28,
        tintColor: '#fff',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: '#353E3A',
    },
    pointsIcon: {
        width: 28,
        height: 28,
        marginRight: 5,
    },
    pointsText: {
        color: '#fff',
        fontSize: 16,
        marginRight: 10,
    },
    cameraContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    cameraPreview: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
        height: '100%',
    },
    captureButtonContainer: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 30,
    },
    captureButton: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
    },
    captureButtonText: {
        fontSize: 14,
        color: '#000',
    },
    LoadingPagecontainer:{

        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',


    },
    Loading_backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1, // Ensure it stays behind content
        backgroundColor: 'black' // Fallback if video fails
      },
      Loading_container: {
        position: 'absolute',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 70,
        bottom:0,
        backgroundColor: "black",
        
    },
    Loading_welcomeText: {
        color: '#fff',
        fontSize: 21,
        textAlign: 'center',
        marginBottom: 20,
        marginHorizontal: 50,
    },
    progressBarContainer: {
        width: '80%',
        height: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
        borderRadius: 5,
        overflow: 'hidden',
        
    },
    progressBar: {
        height: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    completeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#03C988',
        borderRadius: 10,
    },
    completeButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
    exerciseDetailsContainer: {
        marginTop: 10,
        padding: 10, // Reduced padding
        borderRadius: 5, // Reduced radius
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: 10,
        marginLeft: 0,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)', // Added border color
        maxWidth: '90%',
        alignSelf: 'center',
    },
    exerciseText: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'center', // Center text
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 5, // Reduced padding
        borderRadius: 5, // Reduced radius
        maxWidth: '90%',
        alignSelf: 'center',
    },
    completedButton: {
        borderWidth: 1,
        borderColor: 'rgba(3, 201, 136, 0.73)',
        padding: 8, // Reduced padding
        borderRadius: 5, // Reduced radius
        marginHorizontal: 5, // Added horizontal margin
    },
    tutorialButton: {
        borderWidth: 1,
        borderColor: 'rgba(3, 201, 136, 0.73)',
        padding: 8, // Reduced padding
        borderRadius: 5, // Reduced radius
        marginHorizontal: 5, // Added horizontal margin
    },
    buttonText: {
        fontSize: 16,
        color: 'rgba(3, 201, 136, 0.73)',
    },
    exerciseDetailsBox: { // New style
        marginTop: 10,
        padding: 15, // Reduced padding
        borderRadius: 5, // Reduced radius
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: 10,
        marginLeft: 40,
        maxWidth: '100%',
        alignSelf: 'center',
    },
    background_Video: {

        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0 ,
        right:0,

    }, 
    exerciseDetailsText: { // New style
        fontSize: 16,
        color: '#FFF',
    },
});

export default styles;
