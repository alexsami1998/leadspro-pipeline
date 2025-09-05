#!/bin/bash

echo "🧪 Teste de Exportação PDF"
echo "=========================="

# Detectar IP
DETECTED_IP=$(hostname -I | awk '{print $1}')
echo "🌐 IP detectado: $DETECTED_IP"

echo ""
echo "🔍 Verificando se o backend está rodando..."
if curl -s -f http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend funcionando"
else
    echo "❌ Backend não está respondendo"
    echo "📝 Inicie o sistema primeiro com: ./deploy.sh"
    exit 1
fi

echo ""
echo "🧪 Testando endpoint de exportação PDF..."

# Testar exportação de todos os leads
echo "📄 Testando exportação de todos os leads..."
curl -s -o /tmp/leads_completo.pdf "http://localhost:5000/api/leads/export/pdf?filterType=all"

if [ -f /tmp/leads_completo.pdf ] && [ -s /tmp/leads_completo.pdf ]; then
    echo "✅ PDF de todos os leads gerado com sucesso"
    echo "📁 Arquivo salvo em: /tmp/leads_completo.pdf"
    echo "📊 Tamanho: $(ls -lh /tmp/leads_completo.pdf | awk '{print $5}')"
else
    echo "❌ Erro ao gerar PDF de todos os leads"
fi

# Testar exportação por status
echo ""
echo "📄 Testando exportação por status 'Novo'..."
curl -s -o /tmp/leads_novo.pdf "http://localhost:5000/api/leads/export/pdf?filterType=status&status=Novo"

if [ -f /tmp/leads_novo.pdf ] && [ -s /tmp/leads_novo.pdf ]; then
    echo "✅ PDF de leads 'Novo' gerado com sucesso"
    echo "📁 Arquivo salvo em: /tmp/leads_novo.pdf"
    echo "📊 Tamanho: $(ls -lh /tmp/leads_novo.pdf | awk '{print $5}')"
else
    echo "❌ Erro ao gerar PDF de leads 'Novo'"
fi

# Testar exportação por status
echo ""
echo "📄 Testando exportação por status 'Contato'..."
curl -s -o /tmp/leads_contato.pdf "http://localhost:5000/api/leads/export/pdf?filterType=status&status=Contato"

if [ -f /tmp/leads_contato.pdf ] && [ -s /tmp/leads_contato.pdf ]; then
    echo "✅ PDF de leads 'Contato' gerado com sucesso"
    echo "📁 Arquivo salvo em: /tmp/leads_contato.pdf"
    echo "📊 Tamanho: $(ls -lh /tmp/leads_contato.pdf | awk '{print $5}')"
else
    echo "❌ Erro ao gerar PDF de leads 'Contato'"
fi

echo ""
echo "🎉 Teste de exportação PDF concluído!"
echo ""
echo "📁 Arquivos gerados:"
ls -la /tmp/leads_*.pdf 2>/dev/null || echo "Nenhum arquivo PDF encontrado"

echo ""
echo "🌐 Para testar via frontend:"
echo "   Acesse: http://$DETECTED_IP:8080"
echo "   Vá para a página de Leads"
echo "   Clique no botão '📄 Exportar PDF'"
echo ""
echo "🔐 Credenciais:"
echo "   Usuário: admin"
echo "   Senha: 123@mudar"
