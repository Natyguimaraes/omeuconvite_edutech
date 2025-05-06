
export const formatPhoneNumber = (value) => {
    // Remove tudo que não é dígito
    const cleaned = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (cleaned.length <= 10) {
      return cleaned
        .replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3')
        .replace(/-$/, '');
    } else {
      return cleaned
        .replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
        .replace(/-$/, '');
    }
  };
  
  // Função para validar o telefone
  export const isValidPhoneNumber = (phone) => {
    // Remove todos os não dígitos
    const cleaned = phone.replace(/\D/g, '');
    // Verifica se tem 10 ou 11 dígitos (com DDD)
    return cleaned.length >= 10 && cleaned.length <= 11;
  };
  
  