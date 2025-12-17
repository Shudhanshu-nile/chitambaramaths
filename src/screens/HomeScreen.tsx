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

const QUICK_ACTIONS = [
    { id: 1, title: 'Register\nExam', icon: 'calendar-check', bg: '#eef6f8', color: '#0c4b8b' },
    { id: 2, title: 'Rechecking\nExam', icon: 'calendar-search', bg: '#eef6f8', color: '#0c4b8b' },
    { id: 3, title: 'Past\nPapers', icon: 'file-document-outline', bg: '#f0f7f2', color: '#4caf50' },
    { id: 4, title: 'Exam\nResults', icon: 'trophy-outline', bg: '#eef3f8', color: '#2196f3' },
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

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1c75bc" />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ================= HEADER ================= */}
                <LinearGradient colors={['#1c75bc', '#0c4b8b']} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.logoPill}>
                            <Logo height={36} width="100%" preserveAspectRatio="xMinYMid meet" />
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
                                <TouchableOpacity style={styles.signInBtn}>
                                    <Text style={styles.signInText}>Sign In</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.registerBtn}>
                                    <Text style={styles.registerText}>Register</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* ================= QUICK ACTIONS ================= */}
                <View style={styles.quickCard}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <View style={styles.quickRow}>
                        {QUICK_ACTIONS.map(item => (
                            <TouchableOpacity key={item.id} style={styles.quickItem}>
                                <View style={[styles.quickIcon, { backgroundColor: item.bg }]}>
                                    <Icon name={item.icon} size={28} color={item.color} />
                                </View>
                                <Text style={styles.quickText}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ================= KANITHA VIZHA (FIXED) ================= */}
                <LinearGradient colors={['#1c75bc', '#0c4b8b']} style={styles.banner}>
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

            {/* ================= BOTTOM NAV ================= */}
            <View style={styles.bottomNav}>
                <NavItem icon="home" label="Home" active />
                <NavItem icon="map-marker" label="Centers" />
                <NavItem icon="ticket-confirmation" label="Tickets" />
                <NavItem icon="shopping" label="Store" />
                <NavItem icon="account" label="Profile" />
            </View>
        </View>
    );
};

const NavItem = ({ icon, label, active = false }: any) => (
    <TouchableOpacity style={styles.navItem}>
        <Icon name={icon} size={active ? 30 : 24} color={active ? '#0c4b8b' : '#999'} />
        <Text style={[styles.navText, active && { color: '#0c4b8b' }]}>{label}</Text>
    </TouchableOpacity>
);

export default HomeScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },

    header: { height: 430, paddingTop: 60 },

    headerTop: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    logoPill: {
        backgroundColor: '#fff',
        height: 50,
        paddingHorizontal: 24,
        borderRadius: 30,
        justifyContent: 'center',
        maxWidth: 240,
    },

    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
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
        backgroundColor: '#ff5252',
    },

    loginCard: {
        margin: 20,
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
    },

    userIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },

    loginText: { color: '#fff', fontWeight: '600', marginBottom: 10 },

    authRow: { flexDirection: 'row', gap: 10 },

    signInBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
    },

    signInText: { color: '#0c4b8b', fontWeight: '700' },

    registerBtn: {
        borderWidth: 1.5,
        borderColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
    },

    registerText: { color: '#fff', fontWeight: '700' },

    quickCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: -80,
        borderRadius: 20,
        padding: 20,
        elevation: 4,
    },

    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 20 },

    quickRow: { flexDirection: 'row', justifyContent: 'space-between' },

    quickItem: { alignItems: 'center', width: '23%' },

    quickIcon: {
        width: 58,
        height: 58,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },

    quickText: { fontSize: 12, textAlign: 'center', fontWeight: '500' },

    /* ===== FIXED BANNER STYLES ===== */
    banner: {
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
    },

    bannerContent: {
        width: '75%',
    },

    tag: {
        backgroundColor: '#ff5252',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },

    tagText: { color: '#fff', fontSize: 11, fontWeight: '700' },

    bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },

    bannerSub: { color: '#fff', fontSize: 13, marginVertical: 10 },

    bookBtn: {
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 8,
        alignSelf: 'flex-start',
    },

    bookText: { color: '#fff', fontWeight: '700' },

    trophyBox: {
        position: 'absolute',
        right: 16,
        top: 24,
        width: 60,
        height: 60,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.8)',
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    schoolCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#0c4b8b',
        flexDirection: 'row',
        alignItems: 'center',
    },

    schoolIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#2e7db5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },

    schoolTitle: { fontWeight: '700', marginBottom: 5 },

    schoolBtn: {
        backgroundColor: '#0c4b8b',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },

    schoolBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

    examList: { margin: 20 },

    examItem: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    examText: { fontWeight: '600' },

    examTag: {
        backgroundColor: '#ff5252',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },

    examTagText: { color: '#fff', fontSize: 11, fontWeight: '700' },

    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: '#eee',
        justifyContent: 'space-around',
    },

    navItem: { alignItems: 'center' },

    navText: { fontSize: 11, marginTop: 4, color: '#999' },
});
