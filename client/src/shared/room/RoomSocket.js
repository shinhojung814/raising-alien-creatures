// import Wanderer from "../creature/Wanderer.js";
// import { FRAME_PER_SEC, FRAME_PER_EMIT } from "../lib/Constants.js";

class RoomSocket {
  constructor(roomId) {
    this.roomId = roomId;
    this.clientCnt = 0; // TODO: 접속해 있는 사람 수 개념으로 분리
    this.participants = {};
    //
    this.broadcastQueue = [];
  }

  start(io) {
    this.io = io;
  }

  close() {}

  addParticipant(client) {
    // 참가자 추가
    // this.io.to(this.roomId).emit("fieldState", this.getFieldState());
    this.participants[client.clientId] = client;
    this.clientCnt += 1;
    return true;
  }

  removeParticipant(client) {
    // 참가자 제거
    delete this.participants[client.clientId];
    this.clientCnt -= 1;
    // this.io.to(this.roomId).emit("fieldState", this.getFieldState());

    return this.clientCnt;
  }
}

export default RoomSocket;
