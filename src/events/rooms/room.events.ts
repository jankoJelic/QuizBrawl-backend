import { Server } from 'socket.io';

export function getUserDeviceRoom(userId: string, deviceId: string) {
  return `user:${userId}-device:${deviceId}`;
}

export function sendToUserDevice(
  server: Server,
  userId: string,
  deviceId: string,
  event: string,
  payload: any,
) {
  server.to(getUserDeviceRoom(userId, deviceId)).emit(event, payload); // Actually send the message to the user device via WebSocket channel.
}

export enum RoomEvents {
  roomCreated = 'roomCreated',
  userEnteredRoom = 'userEnteredRoom',
  roomUpdated = 'roomUpdated',
  roomDeleted = 'roomDeleted',
}
