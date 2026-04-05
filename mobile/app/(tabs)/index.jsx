import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import KeyboardAvoidingForm from '../../components/KeyboardAvoidingForm';
import { getFirstSync, initLocalDatabase, listRideActivitiesForUser } from '../../db';
import { formatPhoneForDisplay } from '../../utils/formatPhone';
import { avatarFileExists } from '../../utils/profileAvatar';
import { getSessionUserId } from '../../utils/session';

const quickActions = [
  { key: 'ride', title: 'Pedir\ncorrida', bg: '#0A2547', icon: 'car-outline' },
  { key: 'delivery', title: 'Pedir\ndelivery', bg: '#3A84FF', icon: 'bicycle-outline' },
  { key: 'ticket', title: 'Comprar\nbilhete', bg: '#48CAE4', icon: 'ticket-outline' },
  { key: 'work', title: 'Trabalhar com\na plataforma', bg: '#0A2547', icon: 'people-outline' },
];

export default function HomeTabScreen() {
  const router = useRouter();
  const [greetingName, setGreetingName] = useState('');
  const [phoneLine, setPhoneLine] = useState('');
  const [headerAvatarUri, setHeaderAvatarUri] = useState(null);
  const [recentRides, setRecentRides] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          initLocalDatabase();
          const userId = await getSessionUserId();
          if (!active) {
            return;
          }
          if (userId == null) {
            setGreetingName('');
            setPhoneLine('');
            setHeaderAvatarUri(null);
            setRecentRides([]);
            return;
          }
          const row = getFirstSync('SELECT name, phone, avatar_uri FROM users WHERE id = ?', [userId]);
          if (!active || !row) {
            if (active && !row) {
              setGreetingName('');
              setPhoneLine('');
              setHeaderAvatarUri(null);
              setRecentRides([]);
            }
            return;
          }
          const parts = String(row.name || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean);
          const first = parts[0] || '';
          setGreetingName(first);
          setPhoneLine(formatPhoneForDisplay(row.phone));
          let av = row.avatar_uri ? String(row.avatar_uri).trim() : '';
          if (av && !(await avatarFileExists(av))) {
            av = '';
          }
          setHeaderAvatarUri(av || null);

          const rides = listRideActivitiesForUser(userId).slice(0, 3);
          if (active) {
            setRecentRides(rides);
          }
        } catch (e) {
          console.error(e);
          if (active) {
            setGreetingName('');
            setPhoneLine('');
            setHeaderAvatarUri(null);
            setRecentRides([]);
          }
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const greetingText = greetingName ? `Olá, ${greetingName}` : 'Olá';
  const phoneText = phoneLine || '—';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <Image source={require('../../assets/img/icon.png')} style={styles.brandIcon} resizeMode="contain" />
            <Text style={styles.brandText}>Oholo</Text>
          </View>
          <View style={styles.headerActions}>
            <Image
              source={headerAvatarUri ? { uri: headerAvatarUri } : require('../../assets/img/avatar.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
            <Ionicons name="notifications-outline" size={24} color="#0A2547" />
          </View>
        </View>

        <Text style={styles.greeting}>{greetingText}</Text>
        <Text style={styles.phoneLine}>{phoneText}</Text>
        <Text style={styles.location}>Nampula, Moçambique</Text>
      </View>

      <KeyboardAvoidingForm
        style={styles.keyboardArea}
        scrollStyle={styles.scroll}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#6B7D96" />
          <TextInput
            placeholder="Para onde quer ir ou o que deseja fazer?"
            placeholderTextColor="#6B7D96"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.grid}>
          {quickActions.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.actionCard, { backgroundColor: item.bg }]}
              onPress={() => {
                if (item.key === 'ride') {
                  router.push('/ride-request');
                }
                if (item.key === 'delivery') {
                  router.push('/delivery-request');
                }
                if (item.key === 'work') {
                  router.push('/(tabs)/work');
                }
              }}
            >
              <Ionicons name={item.icon} size={30} color="#FFFFFF" />
              <Text style={styles.actionText}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.infoBanner}>
          <Ionicons name="megaphone-outline" size={18} color="#0A2547" />
          <Text style={styles.infoText}>Fase piloto em Nampula.</Text>
        </View>

        <Text style={styles.sectionTitle}>Corridas recentes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentList}>
          {recentRides.length === 0 ? (
            <View style={styles.recentCard}>
              <Ionicons name="car-outline" size={20} color="#8A9AB5" />
              <Text style={styles.recentTitleMuted}>Ainda sem corridas</Text>
              <Text style={styles.recentDateMuted}>Conclua uma corrida para ver aqui o histórico.</Text>
            </View>
          ) : (
            recentRides.map((item) => (
              <Pressable
                key={item.id}
                style={styles.recentCard}
                onPress={() => router.push({ pathname: '/activity-detail', params: { id: item.id } })}
              >
                <Ionicons name="navigate-circle-outline" size={20} color="#006AFF" />
                <Text style={styles.recentTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.recentDate}>
                  {item.date} · {item.time}
                </Text>
                <Text
                  style={[styles.recentStatus, item.status === 'cancelled' && styles.recentStatusCancelled]}
                >
                  {item.statusLabel}
                </Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingForm>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardArea: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: 18,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    gap: 8,
  },
  brandIcon: {
    width: 32,
    height: 32,
  },
  brandText: {
    fontSize: 21,
    lineHeight: 24,
    fontWeight: '800',
    color: '#0A2547',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9E4F2',
  },
  greeting: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: '800',
    color: '#0A2547',
  },
  phoneLine: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#395271',
  },
  location: {
    fontSize: 14,
    color: '#6C7B90',
    marginTop: 4,
    marginBottom: 0,
  },
  searchBox: {
    height: 54,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2B63B8',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: '#0A2547',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    minHeight: 132,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#00000033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  infoBanner: {
    marginTop: 14,
    borderWidth: 2,
    borderColor: '#2B63B8',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#0A2547',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A2547',
    marginTop: 16,
    marginBottom: 10,
  },
  recentList: {
    paddingRight: 8,
    gap: 10,
  },
  recentCard: {
    width: 210,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E8F2',
    padding: 10,
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentTitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2547',
  },
  recentDate: {
    marginTop: 4,
    fontSize: 13,
    color: '#63758F',
  },
  recentStatus: {
    marginTop: 2,
    fontSize: 13,
    color: '#63758F',
  },
  recentStatusCancelled: {
    color: '#B42318',
    fontWeight: '800',
  },
  recentTitleMuted: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
    color: '#51627B',
  },
  recentDateMuted: {
    marginTop: 4,
    fontSize: 13,
    color: '#8A9AB5',
    lineHeight: 18,
  },
});
