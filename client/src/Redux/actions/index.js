// 액션 생성 함수들
import * as types from "./ActionTypes";

export const showModal2 = (onoff) => ({
  type: types.SHOW_MODAL2,
  showModal2: onoff,
});

export const setChalInfoModal = (chalInfoModal) => ({
  type: types.SET_CHAL_INFO_MODAL,
  chalInfoModal,
});

export const setPopupModal = (
  popupModal,
  popupMessage,
  popupKind,
  popupCallback
) => ({
  type: types.SET_POPUP_MODAL,
  popupModal,
  popupMessage,
  popupKind,
  popupCallback,
});

export const showSignUpModal = (onoff) => ({
  type: types.SHOW_SIGNUP,
  showSignUpModal: onoff,
});

export const showSignInModal = (onoff) => ({
  type: types.SHOW_SIGNIN,
  showSignInModal: onoff,
});

export const checkUser = (res) => ({
  type: types.CHECK_USER,
  payload: res,
});

export const logout = () => ({
  type: types.LOGOUT,
});

export const setRoom = ({ roomId, aliens, roomTitle, challenge = {} }) => ({
  type: types.CURRENT_ROOM,
  payload: { roomId, aliens, roomTitle, challenge },
});

export const alienAuth = (alien_auth) => ({
  type: types.ALIEN_AUTH,
  alien_auth: alien_auth,
});

export const selectAlien = (selectedAlien) => ({
  type: types.SELECT_ALIEN,
  payload: selectedAlien,
});

export const graduate = (alienId) => ({
  type: types.GRADUATE_ALIEN,
  payload: alienId,
});

export const setMessage = (msgArray) => ({
  type: types.MESSAGE_UPDATE,
  payload: msgArray,
});

export const joinChallenge = (challenge) => ({
  type: types.JOIN_CHALLENGE,
  payload: challenge,
});
