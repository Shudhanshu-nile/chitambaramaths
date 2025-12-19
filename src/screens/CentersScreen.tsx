import React, { useState } from 'react';
import { StyleSheet, View, Text, StatusBar, TouchableOpacity, TextInput, FlatList, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Colors, Gradients, Fonts, responsiveScreenHeight } from '../constants';
const { width } = Dimensions.get('window');
const SAMPLE_MARKERS = [
    {
        id: '1',
        title: 'Westminster Education Centre',
        coordinate: { latitude: 51.4995, longitude: -0.1245 },
        status: 'Available',
        distance: '2.3 km',
    },
    {
        id: '2',
        title: 'Kensington Academy',
        coordinate: { latitude: 51.5010, longitude: -0.1900 },
        status: 'Available',
        distance: '2.3 km',
    },
    {
        id: '3',
        title: 'Chelsea Learning Hub',
        coordinate: { latitude: 51.4875, longitude: -0.1684 },
        status: 'Available',
        distance: '2.3 km',
    },
];
const CentersScreen = () => {
    const [region, setRegion] = useState<Region>({
        latitude: 51.4995,
        longitude: -0.1357,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06 * (width / responsiveScreenHeight(100)),
    });
    const renderCenter = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.cardSub}>{item.distance} • Capacity 120 • Available 87</Text>
            <TouchableOpacity style={styles.checkButton}>
                <Text style={styles.checkButtonText}>Check Availability</Text>
            </TouchableOpacity>
        </View>
    );
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryBlue} />
            <LinearGradient colors={Gradients.primaryBlue} style={styles.header}>
                <Text style={styles.title}>Find Exam Center</Text>
                <View style={styles.searchRow}>
                    <TextInput placeholder="Search by city name..." placeholderTextColor={Colors.white} style={styles.searchInput} />
                    <TouchableOpacity style={styles.locButton}>
                        <Text style={styles.locButtonText}>Use My Current Location</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
            <View style={styles.mapContainer}>
                <MapView
                    // provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={region}
                    onRegionChangeComplete={(r) => setRegion(r)}
                >
                    {SAMPLE_MARKERS.map((m) => (
                        <Marker key={m.id} coordinate={m.coordinate} title={m.title} />
                    ))}
                </MapView>
            </View>
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.resultsText}>Showing Results For</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>
                <FlatList data={SAMPLE_MARKERS} keyExtractor={(i) => i.id} renderItem={renderCenter} horizontal={false} showsVerticalScrollIndicator={false} />
            </View>
        </View>
    );
};
export default CentersScreen;
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.backgroundColor },
    header: { paddingTop: 50, paddingBottom: 18, paddingHorizontal: 16 },
    title: { fontSize: 20, fontFamily: Fonts.InterSemiBold, color: Colors.white, marginBottom: 12 },
    searchRow: { gap: 10 },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        color: Colors.white,
        fontFamily: Fonts.InterRegular,
    },
    locButton: { marginTop: 10, backgroundColor: Colors.whiteOverlay30, padding: 10, borderRadius: 8, alignItems: 'center' },
    locButtonText: { color: Colors.white, fontFamily: Fonts.InterMedium },
    mapContainer: { height: responsiveScreenHeight(40), margin: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: '#eee' },
    map: { ...StyleSheet.absoluteFillObject },
    listContainer: { flex: 1, paddingHorizontal: 12, paddingBottom: 20 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    resultsText: { fontFamily: Fonts.InterMedium, color: Colors.textGray },
    viewAll: { color: Colors.primaryBlue, fontFamily: Fonts.InterMedium },
    card: { backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginVertical: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    cardTitle: { fontFamily: Fonts.InterSemiBold, color: Colors.primaryDarkBlue },
    statusBadge: { backgroundColor: '#E6F8EE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { color: Colors.iconGreen, fontFamily: Fonts.InterMedium, fontSize: 12 },
    cardSub: { color: Colors.textGray, fontFamily: Fonts.InterRegular, marginBottom: 10 },
    checkButton: { backgroundColor: Colors.primaryBlue, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    checkButtonText: { color: Colors.white, fontFamily: Fonts.InterMedium },
});










