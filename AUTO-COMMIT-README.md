# 🚀 Scripts de Commit Automático

Este projeto inclui scripts para automatizar commits e pushes para o GitHub.

## 📁 Scripts Disponíveis

### 1. **Commit Manual Rápido**
```bash
# Linux/Mac
./auto-commit.sh "sua mensagem aqui"
./auto-commit.sh  # usa mensagem automática com timestamp

# Windows
auto-commit.bat "sua mensagem aqui"
auto-commit.bat   # usa mensagem automática com timestamp
```

### 2. **Monitoramento Automático**
```bash
# Linux/Mac (monitora mudanças automaticamente)
./watch-changes.sh
```

## 🛠️ Configuração

### Para Linux/Mac:
```bash
# Dar permissão de execução
chmod +x auto-commit.sh
chmod +x watch-changes.sh
```

### Para Windows:
```bash
# Os arquivos .bat já podem ser executados diretamente
```

## 📋 Como Usar

### Opção 1: Commit Manual Quando Quiser
```bash
# Quando você fizer mudanças e quiser commitar:
./auto-commit.sh "descrição da mudança"
```

### Opção 2: Monitoramento Automático
```bash
# Deixa rodando em background, detecta e committa mudanças automaticamente:
./watch-changes.sh
```

### Opção 3: Commit Rápido de Tudo
```bash
# Para commitar e enviar todas as mudanças rapidamente:
./auto-commit.sh
```

## ⚡ Exemplos de Uso

```bash
# Commit com mensagem específica
./auto-commit.sh "corrige bug na tela de login"

# Commit automático com timestamp
./auto-commit.sh

# Monitoramento contínuo
./watch-changes.sh
```

## 🚨 Importante

- Os scripts fazem `git add .` (adiciona TODOS os arquivos)
- Sempre fazem push automático para o GitHub
- Para parar o monitoramento automático: `Ctrl+C`

## 🎯 Recomendação

Para desenvolvimento ativo, use:
```bash
./watch-changes.sh
```

Ele detectará mudanças automaticamente e fará commits com timestamps.