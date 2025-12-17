import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Logo from '../assets/images/logo.svg';
import { Colors, Gradients, Fonts, ScreenNames } from '../constants';

const QUICK_ACTIONS = [
    { id: 1, title: 'Register\nExam', icon: 'calendar-check', bg: Colors.lightBlue1, color: Colors.iconBlue1 },
    { id: 2, title: 'Rechecking\nExam', icon: 'calendar-search', bg: Colors.lightBlue1, color: Colors.iconBlue1 },
    { id: 3, title: 'Past\nPapers', icon: 'file-document-outline', bg: Colors.lightGreen1, color: Colors.iconGreen },
    { id: 4, title: 'Exam\nResults', icon: 'trophy-outline', bg: Colors.lightBlue1, color: Colors.iconBlue3 },
    { id: 5, title: 'Event\nPhotos', icon: 'image-multiple', bg: Colors.lightGreen1, color: Colors.iconGreen },
];

const EXAMS = [
    { id: 1, title: 'UK Exam 2026', tag: 'Registration Open' },
    { id: 2, title: 'Canada Exam 2026' },
    { id: 3, title: 'Australia Exam 2026' },
    { id: 4, title: 'New Zealand Exam 2026' },
    { id: 5, title: 'France Exam 2026' },
    { id: 6, title: 'Practise Exams', tag: 'New' },
    { id: 7, title: 'SriLanka Award Ceremony Photos' },
    { id: 8, title: 'SriLanka Exam 2026' },
];

const HomeScreen = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryBlue} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ================= HEADER ================= */}
                <LinearGradient colors={Gradients.primaryBlue} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.logoPill}>
                            <Logo height={36} width={176} />
                        </View>

                        <TouchableOpacity style={styles.notificationBtn}>
                            <Icon name="bell" size={22} color="#fff" />
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>
                    </View>

                    {/* LOGIN CARD */}
                    <View style={styles.loginCard}>
                        <View style={styles.userIcon}>
                            <Icon name="account" size={28} color="#fff" />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.loginText}>Please Login/Signup</Text>

                            <View style={styles.authRow}>
                                <TouchableOpacity
                                    style={styles.signInBtn}
                                    onPress={() => navigation.navigate(ScreenNames.Login)}
                                >
                                    <Text style={styles.signInText}>Sign In</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.registerBtn}
                                    onPress={() => navigation.navigate(ScreenNames.Register)}
                                >
                                    <Text style={styles.registerText}>Register</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* ================= QUICK ACTIONS ================= */}
                <View style={styles.quickCard}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.quickScrollContent}
                    >
                        {QUICK_ACTIONS.map(item => (
                            <TouchableOpacity key={item.id} style={styles.quickItem}>
                                <View style={[styles.quickIcon, { backgroundColor: item.bg }]}>
                                    <Icon name={item.icon} size={28} color={item.color} />
                                </View>
                                <Text style={styles.quickText}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ================= KANITHA VIZHA (FIXED) ================= */}
                <LinearGradient colors={Gradients.primaryBlue} style={styles.banner}>
                    <View style={styles.bannerContent}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>Limited Time</Text>
                        </View>

                        <Text style={styles.bannerTitle}>KANITHA VIZHA{'\n'}2025</Text>

                        <Text style={styles.bannerSub}>
                            Book your tickets now and celebrate excellence in mathematics
                        </Text>

                        <TouchableOpacity style={styles.bookBtn}>
                            <Text style={styles.bookText}>Book Now</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.trophyBox}>
                        <Icon name="trophy" size={36} color="#fff" />
                    </View>
                </LinearGradient>

                {/* ================= REGISTER SCHOOL ================= */}
                <View style={styles.schoolCard}>
                    <View style={styles.schoolIcon}>
                        <Icon name="office-building" size={28} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.schoolTitle}>Register your school</Text>
                        <TouchableOpacity style={styles.schoolBtn}>
                            <Text style={styles.schoolBtnText}>Click Here</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ================= EXAM LIST ================= */}
                <View style={styles.examList}>
                    {EXAMS.map(item => (
                        <TouchableOpacity key={item.id} style={styles.examItem}>
                            <Text style={styles.examText}>{item.title}</Text>

                            {item.tag && (
                                <View style={styles.examTag}>
                                    <Text style={styles.examTagText}>{item.tag}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

export default HomeScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.lightGray },

    header: { height: 430, paddingTop: 60 },

    headerTop: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    logoPill: {
        backgroundColor: Colors.white,
        height: 50,
        paddingHorizontal: 16,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 208,
    },

    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.whiteOverlay20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.red,
    },

    loginCard: {
        margin: 20,
        padding: 20,
        borderRadius: 20,
        backgroundColor: Colors.whiteOverlay25,
        borderWidth: 1,
        borderColor: Colors.whiteOverlay60,
        flexDirection: 'row',
        alignItems: 'center',
    },

    userIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: Colors.whiteOverlay30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },

    loginText: { color: Colors.white, fontFamily: Fonts.InterSemiBold, marginBottom: 10 },

    authRow: { flexDirection: 'row', gap: 10 },

    signInBtn: {
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
    },

    signInText: { color: Colors.primaryDarkBlue, fontFamily: Fonts.InterBold },

    registerBtn: {
        borderWidth: 1.5,
        borderColor: Colors.white,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
    },

    registerText: { color: Colors.white, fontFamily: Fonts.InterBold },

    quickCard: {
        backgroundColor: Colors.white,
        marginHorizontal: 20,
        marginTop: -80,
        borderRadius: 20,
        padding: 20,
        elevation: 4,
    },

    sectionTitle: { fontSize: 16, fontFamily: Fonts.InterBold, marginBottom: 20 },

    quickScrollContent: { paddingRight: 20 },

    quickItem: { alignItems: 'center', width: 80, marginRight: 15 },

    quickIcon: {
        width: 58,
        height: 58,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },

    quickText: { fontSize: 12, textAlign: 'center', fontFamily: Fonts.InterMedium },

    /* ===== FIXED BANNER STYLES ===== */
    banner: {
        marginHorizontal: 10,
        borderRadius: 20,
        padding: 20,
        marginTop: 20,
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        height: 270,
    },

    bannerContent: {
        width: '75%',
    },

    tag: {
        backgroundColor: Colors.red,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },

    tagText: { color: Colors.white, fontSize: 11, fontFamily: Fonts.InterBold },

    bannerTitle: { color: Colors.white, fontSize: 20, fontFamily: Fonts.InterBold },

    bannerSub: { color: Colors.white, fontSize: 13, marginVertical: 10, fontFamily: Fonts.InterRegular },

    bookBtn: {
        borderWidth: 1,
        borderColor: Colors.white,
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 8,
        alignSelf: 'flex-start',
    },

    bookText: { color: Colors.white, fontFamily: Fonts.InterBold },

    trophyBox: {
        position: 'absolute',
        right: 45,
        top: 24,
        width: 60,
        height: 60,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: Colors.whiteOverlay80,
        backgroundColor: Colors.whiteOverlay20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    schoolCard: {
        backgroundColor: Colors.white,
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: Colors.primaryDarkBlue,
        flexDirection: 'row',
        alignItems: 'center',
    },

    schoolIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: Colors.iconBlue4,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },

    schoolTitle: { fontFamily: Fonts.InterBold, marginBottom: 5 },

    schoolBtn: {
        backgroundColor: Colors.primaryDarkBlue,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },

    schoolBtnText: { color: Colors.white, fontFamily: Fonts.InterBold, fontSize: 12 },

    examList: { margin: 20 },

    examItem: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    examText: { fontFamily: Fonts.InterSemiBold },

    examTag: {
        backgroundColor: Colors.red,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },

    examTagText: { color: Colors.white, fontSize: 11, fontFamily: Fonts.InterBold },
});
