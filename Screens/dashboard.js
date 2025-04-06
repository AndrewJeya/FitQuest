import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

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
        { key: 'mon', abbr: 'M' },
        { key: 'tue', abbr: 'Tu' },
        { key: 'wed', abbr: 'W' },
        { key: 'thu', abbr: 'Th' },
        { key: 'fri', abbr: 'F' },
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
                <Image
                    source={require('../assets/user.png')}
                    style={styles.avatar}
                />
                <View style={styles.pointsContainer}>
                    <Image source={require('../assets/points-icon.png')} style={styles.pointsIcon} />
                    <Text style={styles.pointsText}>{points}</Text>
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
                    <Text style={styles.date}>5th March 2025</Text>
                    <Text style={styles.greeting}>{userInfo.name}, Let's conquer the day!</Text>
                    <View style={styles.goalsContainer}>
                        <Text style={styles.goalsText}>{goalsCompleted}/{totalGoals} goals completed</Text>
                    </View>
                </View>

                <View style={styles.dataCards}>
                    <View style={styles.dataCard}>
                        <Text style={styles.cardTitle}>Daily Calories</Text>
                        <Text style={styles.cardValue}>{recommended_calories_per_day}</Text>
                    </View>
                    <View style={[styles.dataCard, { marginLeft: 16 }]}>
                        <Text style={styles.cardTitle}>Exercises</Text>
                        <Text style={styles.cardValue}>{tasks.length}</Text>
                    </View>
                </View>

                <View style={styles.daySelection}>
                    {days.map((day) => (
                        <View key={day.key} style={styles.day}>
                            <Text style={styles.dayText}>{day.abbr}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.todaysPlan}>
                    <Text style={styles.planTitle}>Today's plan</Text>
                        {tasks.length > 0 ? (
                        tasks.map((item, index) => (
                    <View key={index} style={styles.planItem}>
                        <Text style={styles.planTime}>{item.time}</Text>
                        <Text style={styles.planText}>
                            <Text style={styles.planEmoji}>{item.emoji}</Text>
                            {item.title}
                        </Text>
                    </View>
                    ))
                     ) : (
                    <Text style={styles.noPlanText}>No tasks for today.</Text>
                    )}
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                    <TouchableOpacity onPress={() => navigation.navigate('Chat', { userInfo: route.params?.userInfo })}>
                    <Image
                        source={require("../assets/avatarAI.png")}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        zIndex: 1,
        marginTop: 30,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pointsIcon: {
        width: 24,
        height: 24,
        marginRight: 5,
    },
    pointsText: {
        color: '#fff',
        fontSize: 18,
    },
    upgradeButton: {
        borderWidth: 1,
        borderColor: '#00FF00',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    upgradeText: {
        color: '#00FF00',
        fontSize: 16,
    },
    greetingSection: {
        padding: 16,
        zIndex: 1,
        backgroundColor:'rgba(3, 201, 136, 0.24)',
        borderRadius:16
    },
    date: {
        color: '#888',
        fontSize: 16,
    },
    greeting: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    goalsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    goalsText: {
        color: '#fff',
        fontSize: 16,
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

    cardTitle: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 8,
    },
    cardValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    daySelection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        zIndex: 1,
        // backgroundColor: 'rgba(34, 34, 34, 0.8)',
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    day: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        color: '#fff',
        fontSize: 16,
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
        marginBottom: 16,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-between',
        marginBottom:22,
        
    },
    planTime: {
        color: '#888',
        marginRight:6,
        width: 70,
    },
    planText: {
        color: '#fff',
        flex: 1,
        fontSize: 16,
        backgroundColor: 'rgba(103, 122, 132, 0.19)',
        paddingHorizontal:11,
        paddingVertical:11,
        borderRadius:8,
    },
    planEmoji:{

        backgroundColor: 'rgba(245, 245, 245, 0.06)',
        borderRadius:50,
        width:16,
        height:16,
        padding:30,

    },
    bottomBar: {
        alignItems: 'center',
        paddingVertical: 16,
        zIndex: 1,
        backgroundColor: 'transparent', // Set to transparent, then apply gradient
        backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.13) 0%, rgba(160, 157, 174, 0.07) 100%)', // Apply gradient
        shadowColor: 'rgba(0, 0, 0, 0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1, // Shadow opacity
        shadowRadius: 24,
    },
    bottomAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
      noPlanText: {
        color: '#fff',
        fontStyle: 'italic',
        textAlign: 'center'
    }
});

export default DashboardScreen;
