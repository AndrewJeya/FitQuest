import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';

const DashboardScreen = ({ route, navigation }) => {
    const {
        userInfo={},
        recommended_calories_per_day = 2000,
        points = 0,
        tasks = []
    } = route.params || {};

    const goalsCompleted = 5;
    const totalGoals = 10;
    console.log("Tasks in dashboard:", JSON.stringify(tasks, null, 2));

    const days = [
        { key: 'mon', abbr: 'Mo' },
        { key: 'tue', abbr: 'Tu' },
        { key: 'wed', abbr: 'We' },
        { key: 'thu', abbr: 'Th' },
        { key: 'fri', abbr: 'Fr' },
        { key: 'sat', abbr: 'Sa' },
        { key: 'sun', abbr: 'Su' }
    ];

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/dashboardBG.png')}
                style={styles.backgroundImage}
            />

            <View style={styles.topBar}>

                <View style={styles.pointAndavatarContainer}>
                    <Image
                        source={require('../assets/user.png')}
                        style={styles.avatar}
                    />
                    <View style={styles.pointsContainer}>
                        <Image source={require('../assets/points-icon.png')} style={styles.pointsIcon} />
                        <Text style={styles.pointsText}>{points}</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.upgradeButton} 
                    onPress={() => navigation.navigate('Upgrade')}
                >
                    <Text style={styles.upgradeText}>Upgrade</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                <View style={styles.greetingSection}>
                    <View style={styles.greetingRightContainer}>
                        <Text style={styles.date}>5th March 2025</Text>
                        <Text style={styles.greetingName}>{userInfo.name},</Text>
                        <Text style={styles.greetingText}>Let's conquer the day!</Text>
                        <View style={styles.goalsContainer}>
                            <Text style={styles.goalsText}>{goalsCompleted}/{totalGoals} goals completed</Text>
                        </View>
                    </View>
                    <View style={styles.greetingLeftContainer}>
                        <Image
                            source={require('../assets/dashboardProgress.png')}
                            style={styles.greetingProgress}
                        />
                    </View>
                </View>

                <View style={styles.dataCards}>
                    <View style={styles.dataCard}>
                        <View style={styles.cardTitleAndImage}>
                            <Text style={styles.cardTitle}>Daily Calories</Text>
                            <Image
                            source={require('../assets/fireDashboard.png')}
                            style={styles.cardImage}
                          
                            />
                        </View>
                        <View style={styles.cardProgressBarContainer}>
                            <View style={styles.cardProgressBarFill}></View>
                        </View>
                        <Text style={styles.cardValue}>{recommended_calories_per_day}</Text>
                    </View>
                    <View style={[styles.dataCard, { marginLeft: 16 }]}>
                    <View style={styles.cardTitleAndImage}>
                            <Text style={styles.cardTitle}>Exercises</Text>
                            <Image
                            source={require('../assets/exerciseDashboard.png')}
                            style={styles.cardImage}
        
                            />
                        </View>
                        <View style={styles.cardProgressBarContainer}>
                            <View style={styles.cardProgressBarFill}></View>
                        </View>
                        <Text style={styles.cardValue}>{tasks.length}</Text>
                    </View>
                </View>

                <View style={styles.daySelection}>
                    {days.map((day) => (
                        <View key={day.key} style={styles.day}>
                            <Text style={styles.dayText}>{day.abbr}</Text>
                            <View style={styles.dayProgress}>
                                <Text style={styles.dayProgressText}>0%</Text>
                            </View>
                        </View>
                    ))}

                </View>

                <View style={styles.todaysPlan}>
                    <Text style={styles.planTitle}>Today's plan</Text>
                        {tasks.length > 0 ? (
                        tasks.map((item, index) => (
                    <View key={index} style={styles.planItem}>
                        <Text style={styles.planTime}>{item.time}</Text>
                        <View style={styles.taskContainer}>
                            <View style={styles.planEmojiBackground}>
                                <Text style={styles.planEmoji}>{item.emoji}</Text>
                            </View>
                            <Text style={styles.planText}>{item.title}</Text>
                        </View>
                    </View>
                    ))
                     ) : (
                    <Text style={styles.notaskContainer}>No tasks for today.</Text>
                    )}
                </View>
            </ScrollView>

    <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.trainerAIButton} onPress={() => navigation.navigate('Chat', { userInfo: route.params?.userInfo })}>
            <LottieView 
                style={styles.animationAI} 
                source={require('../assets/animationAI.json')} 
                autoPlay 
                loop 
            />
            <Image
                source={require('../assets/valorAI.png')}
                style={styles.bottomAvatar}
            />
        </TouchableOpacity>
    </View>
 </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollView: {
        flex: 1,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.8,
        resizeMode: 'cover',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center',
        padding: 16,
        zIndex: 1,
        marginTop: 50,
    },
    pointAndavatarContainer:{
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center',

    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 20,
        marginRight:20,
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:'#353E3A',
        paddingRight:12,
        borderRadius:50,
    },
    pointsIcon: {
        width: 30,
        height: 30,
        marginRight: 5,
    },
    pointsText: {
        color: '#fff',
        fontSize: 18,
    },
    upgradeButton: {
        backgroundColor:'rgba(53, 62, 58, 0.40)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    upgradeText: {
        color:'rgba(3, 201, 136, 0.73)',
        fontSize: 16,
    },
    greetingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-between',
        padding: 20,
        zIndex: 1,
        backgroundColor:'rgba(3, 201, 136, 0.24)',
        borderRadius:16,
        marginHorizontal:16,
        marginTop:24,
        marginBottom:18,
        
    },
    greetingRightContainer:{},
    greetingLeftContainer:{},
    date: {
        color:'rgba(245, 245, 245, 0.30)',
        fontSize: 16,
        marginBottom:16,
    },
    greetingName:{

        fontSize:18,
        color:'white',

    },
    greetingText:{
        
        fontSize:18,
        color:'white',

    },
    goalsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    goalsText: {
        color: '#C2F997',
        fontSize: 18,
    },
    dataCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        zIndex: 1,
        marginBottom: 16,
    },
    dataCard: {
        flex: 1,
        backgroundColor: 'rgba(103, 122, 132, 0.19)',
        borderRadius: 16,
        padding: 16,
        minHeight: 100,
    },

    cardTitleAndImage:{
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'space-between',
        marginBottom:8,
       
    },

    cardImage:{
        height:26,
        width:26,
    },

    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardProgressBarContainer:{
        backgroundColor:'rgba(255,255,255,0.16)',
        borderRadius:8,
        height:8,
        marginTop:20,
    },
    cardProgressBarFill:{
        backgroundColor: 'rgba(3,201,136,0.73)',
        width: '80%',  // Percentage based
        height: '100%',
        borderRadius: 8,
    },
    cardValue: {
        color: '#fff',
        fontSize: 14,
        marginTop:8,
        
    },
    daySelection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        zIndex: 1,
        //backgroundColor: 'rgba(34, 34, 34, 0.20)',
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 16,
        marginTop:16,
    },
    day: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText:{ 
        color: '#fff',
    },
    dayProgress:{
        backgroundColor:'rgba(245,245,245,0.06)',
        borderColor:'rgba(217,217,217,0.08)',
        borderWidth:1,
        height:36,
        width:36,
        borderRadius:50,
        marginTop:10,
        justifyContent:'center',
        alignItems:'center',
    },
    dayProgressText:{

        color: '#f5F5F5',
        fontSize:12,

    },
    todaysPlan: {
        padding: 16,
        zIndex: 1,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    planTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom:22,
        
    },
    planTime: {
        color: '#888',
        marginRight:6,
        width: 70,
        
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(103, 122, 132, 0.19)',
        paddingHorizontal:11,
        paddingVertical:11,
        borderRadius:8,
        flex:1,
        flexWrap: 'wrap',
    },
    planText:{
        color: 'white',
        fontSize: 16,

    },
    planEmoji:{
        width:18,
        height:18,
        
    },
    planEmojiBackground:{
        backgroundColor: 'rgba(245, 245, 245, 0.06)',
        padding:10,
        borderRadius:'50%',
        marginRight:15,
    },

    bottomBar: {
        alignItems: 'center',
        justifyContent:'center', 
        zIndex: 1,
        backgroundColor: 'transparent', // Set to transparent, then apply gradient
        paddingBottom:30,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    trainerAIButton: {
        width: 70,  // Increased container size
        height: 70, // Increased container size
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative', // Important for absolute positioning
        backgroundColor: 'transparent', // Make button background transparent
    
        
    },
    animationAI: {
        ...StyleSheet.absoluteFillObject, // Fills the container
        width: '100%',  // Takes full width of container
        height: '100%', // Takes full height of container
    
    },
    bottomAvatar: {
        zIndex: 2,
        height: 50,     // Slightly larger avatar
        width: 50,      // Slightly larger avatar
        borderRadius: 30,
        position: 'absolute', // Positions relative to trainerAIButton
    },
      notaskContainer: {
        color: '#fff',
        fontStyle: 'italic',
        textAlign: 'center'
    }
});

export default DashboardScreen;
