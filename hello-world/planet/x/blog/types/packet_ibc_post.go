package types

// ValidateBasic is used for validating the packet
func (p IbcPostPacketData) ValidateBasic() error {

	// TODO: Validate the packet data

	return nil
}

// GetBytes is a helper for serialising
func (p IbcPostPacketData) GetBytes() ([]byte, error) {
	var modulePacket BlogPacketData

	modulePacket.Packet = &BlogPacketData_IbcPostPacket{&p}

	return modulePacket.Marshal()
}
