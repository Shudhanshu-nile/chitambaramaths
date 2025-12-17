import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Logo from '../assets/images/logo.svg';
import { Colors, Gradients } from '../constants';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b5f8f" />

      {/* ✅ SINGLE SCROLL VIEW */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER (SCROLLS WITH CONTENT) */}
        <LinearGradient colors={['#1b77a8', '#0b5f8f']} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={22} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.logoCard}>
            <Logo width={width * 0.6} height={50} />
          </View>

          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to continue your learning journey
          </Text>
        </LinearGradient>

        {/* LOGIN CARD */}
        <View style={styles.loginCard}>
          <Text style={styles.title}>Student Login</Text>
          <Text style={styles.subtitle}>
            Enter your credentials to access your account
          </Text>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputBox}>
            <Icon name="email-outline" size={20} color="#9aa3af" />
            <TextInput
              placeholder="student@example.com"
              placeholderTextColor="#b0b8c4"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputBox}>
            <Icon name="lock-outline" size={20} color="#9aa3af" />
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#b0b8c4"
              style={styles.input}
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Icon
                name={secure ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#9aa3af"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signInBtn}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* SIGN UP CARD */}
        <View style={styles.signUpCard}>
          <Text style={styles.signUpText}>
            Don't have an account?{' '}
            <Text style={styles.signUpLink}>Sign Up</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  scrollContent: {
    paddingBottom: 30, // prevents cut-off
  },

  header: {
    height: 310,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    paddingTop: 60,
  },

  backButton: {
    position: 'absolute',
    top: 30,
    left: 18,
    width: 38,
    height: 38,
    // borderRadius: 19,
    // backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoCard: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  loginCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: -30, // overlap effect
    borderRadius: 28,
    padding: 22,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  welcomeTitle: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 20,
  },

  welcomeSubtitle: {
    color: '#e6f1f8',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#7b8794',
    marginBottom: 22,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 14,
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f6fa',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },

  signInBtn: {
    backgroundColor: '#005c88',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 28,
  },

  signInText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  forgot: {
    textAlign: 'center',
    color: '#005c88',
    marginTop: 18,
    fontWeight: '600',
  },

  signUpCard: {
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#005c88',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },

  signUpLink: {
    color: '#005c88',
    fontWeight: '700',
  },
});
