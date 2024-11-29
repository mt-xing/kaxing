export type ControllerJoinResponse = {
  password: string;
};

export type ErrorResponse = {
  reason: string;
};

export type ControllerSuccessResponse = {
  players: { name: string; id: string }[];
};

export type JoinRoomPayload = {
  name: string;
  id: string;
};

export type KickPlayerPayload = {
  id: string;
};
