export const deviceMessageAdapterMock = jest.fn();

deviceMessageAdapterMock.mockImplementation(() => ({
  publishDeviceMessage: jest.fn(),
  listenForDeviceMessages: jest.fn(),
  subscribeToTopic: jest.fn(),
}));
