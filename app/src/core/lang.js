import http from "./http.js";
import me from "./me.js";

const en = {
    "previous_coms": "See previous comments",
    "next_coms": "See next comments",
    "ago": "{{duration}} ago",
    "groups": "Groups",
    "login_placeholder": "email",
    "password_placeholder": "password",
    "new_password_placeholder": "new password",
    "confirm_password_placeholder": "confirm password",
    "connect": "Connection",
    "submit": "Submit",
    "title_placeholder": "Title of your message (optional)",
    "text_placeholder": "Write your message here",
    "upload_image": "Add photos",
    "upload_video": "Add videos",
    "upload_music": "Add musics",
    "add_date": "Add a date",
    "logout": "Logout",
    "settings": "Settings",
    "name": "Name",
    "name_input": "Choose a name",
    "login": "Login",
    "login_input": "Choose a login",
    "email": "Email",
    "email_input": "Fill in your email here",
    "save_changes": "Save changes",
    "password": "Password",
    "password_input": "Write a new password here",
    "Invalid login/password": "Invalid login and/or password",
    "edit": "Edit",
    "delete": "Delete",
    "ask_delete_message": "Are you sure to delete this message?",
    "account": "Account",
    "groups": "Groups",
    "forgot_password": "Did you forget your password?",
    "password_reset_mail_sent": "The password reset email was sent !",
    "User not found": "User not found",
    "reset_password_title": "Reset your password",
    "error": "An error occurred",
    "passwords_dont_match": "Passwords don't match",
    "invitation_link": "Invitation link",
    "reset_invitation_link": "Reset invitation link",
    "invitation_welcome": "Welcome on Zusam ! Please sign up before joining the group.",
    "signup": "Sign up",
    "create_a_group": "Create a group",
    "create_the_group": "Create the group",
    "quit_group": "Leave the group",
    "settings_updated": "Your settings were updated",
    "group_updated": "The group was updated !",
    "group_left": "You left the group !",
    "multiple_photos_upload": "An error ocurred. Try uploading images one by one (this can happen in some browsers)",
    "error_new_message": "An error occurred while sending your message",
    "error_upload": "An error occurred during the upload",
    "cancel_write": "Do you really want to cancel writing a new message?",
    "empty_message": "The message is empty and cannot be sent !",
    "cancel": "Cancel",
    "just_now": "Just now",
    "notification_emails": "Email notifications",
    "none": "None",
    "hourly": "Hourly",
    "daily": "Daily",
    "weekly": "Weekly",
    "monthly": "Monthly",
    "notification_emails_stopped": "Email notifications stopped !",
    "group_share_choice": "To which group do you want to send this message?",
    "public_link": "public link",
    "default_group": "Default group",
    "destroy_account": "Delete your account",
    "destroy_account_explain": "Once you delete your account, there is no going back. Please be certain.",
    "are_you_sure": "Are you sure?",
    "share_message": "share the message",
    "users": "users",
    "has_posted_in": "has posted in",
    "has_commented_on": "has commented on",
    "has_joined": "has joined",
    "has_left": "has left",
    "the_message_from": "the message from",
    "in": "in",
    "lang": "language",
    "reply": "reply",
    "replies": {
        "0": "{{count}} reply",
        "2":"{{count}} replies"
    },
    "publish_in_group": "publish in the group",
    "search_in_group": "search in this group",
    "changed_group_name": "changed the group's name",
    "to": "to",
    "notifications": "notifications",
    "mark_all_as_read": "mark all as read",
    "search_without_result": "Your search did not match any message.",
    "add_bookmark": "Bookmark message",
    "remove_bookmark": "Unbookmark message",
    "bookmarks": "bookmarks",
    "api_key": "API key",
    "reset_api_key": "Reset the API key (you will be disconnected)"
};

const lang = {
  dict: {en},//[], // dicts loaded for the current session
  possibleLang: {
    en: "English",
    es: "Español",
    fr: "Français",
    sk: "Slovenský"
  }, // possible dicts names to load
  getDefaultLang: () =>
    (document.querySelector("meta[name='zusam:default-lang']") || {}).content ||
    "en",
  getCurrentLang: () => "en",//me.data
      //? me.data["lang"] || lang.getDefaultLang()
      //: lang.getDefaultLang(),
  fetchDict: (dict = lang.getCurrentLang()) => {
    return new Promise(() => {});
    //console.warn("FETCH DICT");
    //if (!lang.dict[dict]) {
    //  http.get(`/lang/${dict}.json`).then(r => {
    //    lang.dict[dict] = r;
    //    window.dispatchEvent(new CustomEvent("fetchedNewDict"));
    //  });
    //}
  },
  t: (id, params = {}) => {
    // prepare default values
    params.dict = params["dict"] || lang.getCurrentLang();
    params.count = params["count"] || 0;

    // quick validity checks
    if (!id || !lang.dict[params.dict]) {
      return "";
    }

    // select translation string corresponding to count
    // We treat the list of translation keys like ranges
    // So if we have the keys 0, 1, 5; we have the ranges [0], [1, 4], [5, +inf]
    let str = lang.dict[params.dict][id] || "";
    if (typeof str == "object") {
      let keys = Object.getOwnPropertyNames(str)
        .map(e => +e)
        .filter(e => !isNaN(e) && e <= params.count)
        .sort((a, b) => a - b);
      str = keys.length ? str[keys.slice(-1)[0]] : "";
    }

    // replace parameters
    Object.assign([], str.match(/{{\w+}}/g)).forEach(s => {
      let rid = s.replace(/[{}]/g, "");
      if (params[rid]) {
        str = str.replace(s, params[rid]);
      }
    });

    return str;
  }
};
export default lang;
