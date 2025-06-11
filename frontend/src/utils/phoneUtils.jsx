export const formatPhoneNumber = (value) => {
  if (!value) return '';

  // Remove tudo que não é dígito
  let cleaned = value.toString().replace(/\D/g, '');

  // Limita a no máximo 11 dígitos
  cleaned = cleaned.slice(0, 11);

  // Aplica a máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (cleaned.length <= 10) {
    return cleaned
      .replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3')
      .replace(/[-\s]+$/, '');
  } else {
    return cleaned
      .replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
      .replace(/[-\s]+$/, '');
  }
};


export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;

  const cleaned = phone.toString().replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
};

  
  