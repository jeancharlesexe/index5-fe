const ERROR_MESSAGES = {
    // Auth errors
    'INVALID_CREDENTIALS': 'Usuário ou senha inválidos.',
    'INACTIVE_USER': 'Usuário inativo. Entre em contato com o suporte.',
    'NAME_REQUIRED': 'O nome é obrigatório.',
    'CPF_REQUIRED': 'O CPF é obrigatório.',
    'EMAIL_REQUIRED': 'O e-mail é obrigatório.',
    'PASSWORD_REQUIRED': 'A senha é obrigatória.',
    'BIRTHDATE_REQUIRED': 'A data de nascimento é obrigatória.',
    'CLIENT_SHOULD_NOT_HAVE_JKEY': 'Clientes não devem possuir Chave J.',
    'CPF_ALREADY_REGISTERED': 'Este CPF já está cadastrado.',
    'EMAIL_ALREADY_REGISTERED': 'Este e-mail já está cadastrado.',
    'JKEY_ALREADY_REGISTERED': 'Esta Chave J já está cadastrada.',
    'JKEY_REQUIRED': 'A Chave J é obrigatória para administradores.',
    'INVALID_ROLE': 'Cargo inválido.',

    // Literal English overrides (in case code extraction fails)
    'Invalid CPF or password.': 'CPF ou senha inválidos.',
    'Invalid JKey or password.': 'Chave J ou senha inválidos.',
    'Inactive user.': 'Usuário inativo. Entre em contato com o suporte.',
    'User registered successfully.': 'Usuário cadastrado com sucesso!',
    'Name is required.': 'O nome é obrigatório.',
    'CPF is required.': 'O CPF é obrigatório.',
    'Email is required.': 'O e-mail é obrigatório.',
    'Password is required.': 'A senha é obrigatória.',
    'Birth date is required.': 'A data de nascimento é obrigatória.',

    // Basket / Engine errors
    'BASKET_NOT_FOUND': 'Nenhuma cesta ativa encontrada.',
    'NO_ACTIVE_CLIENTS': 'Nenhum cliente ativo encontrado para execução.',
    'INVALID_ASSET_COUNT': 'A cesta deve conter exatamente 5 ativos.',
    'INVALID_PERCENTAGES': 'A soma das porcentagens deve ser exatamente 100%.',

    // Generic / Network
    'SERVER_ERROR': 'Erro interno do servidor. Tente novamente mais tarde.',
    'NETWORK_ERROR': 'Erro de conexão. Verifique se o servidor está rodando.',
};

export const translateError = (errorCode, defaultMessage = 'Ocorreu um erro inesperado.') => {
    return ERROR_MESSAGES[errorCode] || defaultMessage;
};
