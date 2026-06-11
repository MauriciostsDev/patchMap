# 0001 — Stack do Frontend

- **Data:** 2026-06-10
- **Status:** aceita

## Contexto
O `IMPLEMENTACAO_FRONTEND.md` recomenda React Native + Expo (opção A) ou Flutter (opção B). O protótipo
de referência é React (web).

## Decisão
**React Native + Expo + TypeScript.** Estado com **Zustand + persist** (não Redux), por ser mais leve e
suficiente para o escopo offline. Ícones via **`react-native-svg`/`SvgXml`** reaproveitando os paths do
protótipo. Tema via **Context próprio** emulando as CSS variables.

## Por quê
- Expo dá web + Android + iOS com um código só; o protótipo já é React, port direto.
- Zustand espelha quase 1:1 o `useState`/localStorage do `app.jsx` original.
- `SvgXml` permite colar os paths SVG existentes sem reescrever ícones.

## Alternativas descartadas
- **Flutter:** reescreveria tudo do zero; perde a fidelidade com o protótipo React.
- **Redux Toolkit:** overhead desnecessário para o tamanho do estado.

Relacionado: [[Arquitetura Frontend]].
