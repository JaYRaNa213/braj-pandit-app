import React from 'react';
import { Text, View, Button, TouchableOpacity, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors } from '../assets/constants/colors';
function IncomingCall() {
    return (
        <View style={styles.container}>
            <Text style={styles.time}>12:35 PM</Text>
            <View style={styles.userInfo}>
                <View style={styles.profilePicture}>
                    <AntDesign name="user" size={80} color="#fff" />
                </View>
                <Text style={styles.name}>Sister</Text>
                <Text style={styles.calling}>CALLING...</Text>
            </View>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={[styles.button]}>
                    <FontAwesome name="phone" size={27} color="#F44336" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button]}>
                    <FontAwesome name="phone" size={27} color="#4CAF50" style={{ transform: [{ rotate: '-90deg' }] }} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.messageButton}>
                <Text style={styles.messageButtonText}>Send Message</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.purple, // Light blue background
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    time: {
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
    },
    userInfo: {
        alignItems: 'center',
        marginTop: 20,
    },
    profilePicture: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ffffff50',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    name: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    calling: {
        fontSize: 16,
        color: '#fff',
        marginTop: 5,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
    },
    button: {
        width: 65,
        height: 65,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    messageButton: {
        backgroundColor: '#ffffff50',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 40,
        marginBottom: 20,
    },
    messageButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default IncomingCall;
