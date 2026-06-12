// LoginScreen.tsx — Tela de login (port de screen-login.jsx).

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { sans } from '../theme/fonts';
import { Icon } from '../components/Icon';

export function LoginScreen() {
  const t = useTheme();
  const signIn = useAppStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function submit() {
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha para continuar.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // sucesso: o RootNavigator troca de tela ao ver isLoggedIn = true.
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : 'Não foi possível conectar ao servidor.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const field = (extra: object) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    backgroundColor: t.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: t.border,
    ...extra,
  });
  const inputBase = {
    flex: 1,
    fontSize: 15,
    color: t.text,
    fontFamily: sans(400),
    padding: 0,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 22, paddingBottom: 20 }}>
          {/* Hero */}
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: 340,
              paddingBottom: 8,
            }}
          >
            <Image
              source={require('../../assets/icon.png')}
              style={{
                width: 88,
                height: 88,
                borderRadius: 22,
                marginBottom: 18,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.18,
                shadowRadius: 36,
              }}
            />
            <Text
              style={{
                fontSize: 28,
                fontFamily: sans(800),
                color: t.text,
                letterSpacing: -0.6,
                marginBottom: 4,
              }}
            >
              PatchMap
            </Text>
            <Text style={{ fontSize: 13.5, fontFamily: sans(500), color: t.muted, marginBottom: 38 }}>
              Rastreador de Conexões de Rede
            </Text>

            {/* Form */}
            <View style={{ width: '100%', gap: 11 }}>
              {/* E-mail */}
              <View style={field({})}>
                <Icon name="mail" size={19} color={t.muted} />
                <TextInput
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setError('');
                  }}
                  placeholder="usuario@orgao.gov.br"
                  placeholderTextColor={t.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={inputBase}
                />
              </View>

              {/* Senha */}
              <View style={field(error ? { borderColor: '#ef4444', borderWidth: 1.5 } : {})}>
                <Icon name="lock" size={19} color={t.muted} />
                <TextInput
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setError('');
                  }}
                  placeholder="Senha"
                  placeholderTextColor={t.muted}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  style={inputBase}
                  onSubmitEditing={submit}
                />
                <Pressable onPress={() => setShowPass((s) => !s)} hitSlop={8} style={{ padding: 4 }}>
                  <Icon name={showPass ? 'eyeoff' : 'eye'} size={18} color={t.muted} />
                </Pressable>
              </View>

              {/* Erro */}
              {error ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingVertical: 9,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    backgroundColor: 'rgba(239,68,68,0.10)',
                  }}
                >
                  <Icon name="alert" size={16} color="#ef4444" stroke={2.5} />
                  <Text style={{ color: '#ef4444', fontSize: 13.5, fontFamily: sans(500), flex: 1 }}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Botão entrar */}
              <Pressable
                onPress={submit}
                disabled={loading}
                style={{
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: t.accent,
                  marginTop: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading ? 0.85 : 1,
                }}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={{ color: t.accentInk, fontSize: 15.5, fontFamily: sans(700) }}>
                      Autenticando…
                    </Text>
                  </>
                ) : (
                  <Text style={{ color: t.accentInk, fontSize: 15.5, fontFamily: sans(700) }}>
                    Entrar
                  </Text>
                )}
              </Pressable>

              {/* Esqueci a senha */}
              <Pressable style={{ paddingVertical: 6 }}>
                <Text
                  style={{ color: t.accent, fontSize: 14, fontFamily: sans(600), textAlign: 'center' }}
                >
                  Esqueci a senha
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Rodapé */}
          <Text style={{ fontSize: 12, fontFamily: sans(400), color: t.muted, opacity: 0.65 }}>
            PatchMap v1.0 · Gestão de Rede Interna
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
