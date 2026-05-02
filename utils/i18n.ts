import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      auth: {
        title_email: "Login",
        title_login: "Login with password",
        title_register: "Registration",
        email_placeholder: "Enter Email",
        next: "Next",
        password_placeholder: "Password",
        confirm_password_placeholder: "Confirm password",
        first_name_placeholder: "First Name",
        last_name_placeholder: "Last Name",
        login_btn: "Login",
        register_btn: "Register",
        change_email: "Change email",
        error_email_empty: "Please enter email",
        error_password_empty: "Please enter password",
        error_fill_all: "Please fill in all fields",
        error_passwords_dont_match: "Passwords don't match",
        error_login: "Incorrect password or connection error.",
        subtitle_register: "Create an account for {{email}}",
      },
      chatList: {
        placeholder_email: "User Email",
        btn_create: "Create chat",
        empty: "You have no chats yet",
        error_email_empty: "Please enter user email",
        error_user_not_found: "User not found",
        error_chat_exists: "Chat with this user already exists",
        saved_messages_tag: " (You)",
        unknown_chat: "Unknown Chat"
      },
      chat: {
        input_placeholder: "Enter message...",
        btn_send: "Send"
      }
    }
  },
  ru: {
    translation: {
      auth: {
        title_email: "Вход",
        title_login: "Вход по паролю",
        title_register: "Регистрация",
        email_placeholder: "Введите Email",
        next: "Далее",
        password_placeholder: "Пароль",
        confirm_password_placeholder: "Повторите пароль",
        first_name_placeholder: "Имя",
        last_name_placeholder: "Фамилия",
        login_btn: "Войти",
        register_btn: "Зарегистрироваться",
        change_email: "Изменить email",
        error_email_empty: "Введите email",
        error_password_empty: "Введите пароль",
        error_fill_all: "Заполните все поля",
        error_passwords_dont_match: "Пароли не совпадают",
        error_login: "Неверный пароль или ошибка подключения.",
        subtitle_register: "Создание аккаунта для {{email}}",
      },
      chatList: {
        placeholder_email: "Email пользователя",
        btn_create: "Создать чат",
        empty: "У вас пока нет чатов",
        error_email_empty: "Введите email пользователя",
        error_user_not_found: "Пользователь не найден",
        error_chat_exists: "Чат с этим пользователем уже существует",
        saved_messages_tag: " (Вы)",
        unknown_chat: "Unknown Chat"
      },
      chat: {
        input_placeholder: "Введите сообщение...",
        btn_send: "Отправить"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
