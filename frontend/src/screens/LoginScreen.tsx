// LoginScreen.tsx — Tela de login (estética "console técnico").

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
import { sans, mono } from '../theme/fonts';
import { Icon } from '../components/Icon';

export function LoginScreen() {
  const t = useTheme();
  const signIn = useAppStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focus, setFocus] = useState<'email' | 'pass' | null>(null);

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

  const field = (active: boolean, err?: boolean) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    backgroundColor: t.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    borderWidth: 1.5,
    borderColor: err ? '#f43f5e' : active ? t.accent : t.border,
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
              maxWidth: 360,
              paddingBottom: 8,
            }}
          >
            {/* Logo + glow */}
            <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <View
                style={{
                  position: 'absolute',
                  width: 220,
                  height: 220,
                  borderRadius: 999,
                  backgroundColor: t.accent,
                  opacity: 0.1,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 140,
                  height: 140,
                  borderRadius: 999,
                  backgroundColor: t.accent,
                  opacity: 0.12,
                }}
              />
              <Image
                source={require('../../assets/icon.png')}
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: t.borderStrong,
                }}
              />
            </View>

            <Text
              style={{
                fontSize: 30,
                fontFamily: sans(800),
                color: t.text,
                letterSpacing: -0.6,
                marginBottom: 6,
              }}
            >
              PatchMap
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                paddingVertical: 5,
                paddingHorizontal: 11,
                borderRadius: 999,
                backgroundColor: t.surface,
                borderWidth: 1,
                borderColor: t.border,
                marginBottom: 40,
              }}
            >
              <View
                style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: t.accent }}
              />
              <Text style={{ fontSize: 12, fontFamily: mono(500), color: t.muted, letterSpacing: 0.3 }}>
                Rastreador de Conexões de Rede
              </Text>
            </View>

            {/* Form */}
            <View style={{ width: '100%', gap: 11 }}>
              {/* E-mail */}
              <View style={field(focus === 'email')}>
                <Icon name="mail" size={19} color={focus === 'email' ? t.accent : t.muted} />
                <TextInput
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setError('');
                  }}
                  onFocus={() => setFocus('email')}
                  onBlur={() => setFocus(null)}
                  placeholder="usuario@orgao.gov.br"
                  placeholderTextColor={t.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={inputBase}
                />
              </View>

              {/* Senha */}
              <View style={field(focus === 'pass', !!error)}>
                <Icon name="lock" size={19} color={focus === 'pass' ? t.accent : t.muted} />
                <TextInput
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setError('');
                  }}
                  onFocus={() => setFocus('pass')}
                  onBlur={() => setFocus(null)}
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
                    backgroundColor: 'rgba(244,63,94,0.12)',
                    borderWidth: 1,
                    borderColor: 'rgba(244,63,94,0.3)',
                  }}
                >
                  <Icon name="alert" size={16} color="#f43f5e" stroke={2.5} />
                  <Text style={{ color: '#fda4af', fontSize: 13.5, fontFamily: sans(500), flex: 1 }}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Botão entrar */}
              <Pressable
                onPress={submit}
                disabled={loading}
                style={{
                  height: 54,
                  borderRadius: 14,
                  backgroundColor: t.accent,
                  marginTop: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading ? 0.85 : 1,
                  shadowColor: t.accent,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 6,
                }}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color={t.accentInk} />
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
          <Text style={{ fontSize: 11.5, fontFamily: mono(400), color: t.muted, opacity: 0.7 }}>
            PatchMap v1.0 · Gestão de Rede Interna
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
