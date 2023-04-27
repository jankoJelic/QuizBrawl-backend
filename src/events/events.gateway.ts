import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { getUserDeviceRoom } from './rooms/room.events';

@WebSocketGateway({
  namespace: 'events',
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  public server: Server;

  afterInit(server: any) {
    console.log('after init');
  }

  handleConnection(@ConnectedSocket() client: any) {
    console.log('CLIENT CONNECTED');
    // console.log(
    //   `user ${client.user.id} with socket ${client.id} connected with device ${client.handshake?.query?.deviceId}`,
    // );

    // client.join(
    //   getUserDeviceRoom(
    //     client.user.id,
    //     client.handshake.query.deviceId.toString(),
    //   ),
    // );
  }

  handleDisconnect(@ConnectedSocket() client: any) {
    console.log(
      `user ${client.user.id} with socket ${client.id} with device ${client.handshake?.query?.deviceId} DISCONNECTED`,
    );

    client.leave(
      getUserDeviceRoom(
        client.user.id,
        client.handshake.query.deviceId.toString(),
      ),
    );
  }

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): string {
    console.log('event arrived on BE');
    // console.log(data, client);
    return data;
  }
}
