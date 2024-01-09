package keeper

type Migrator struct {
	keeper Keeper
}

func NewMigrator(k Keeper) Migrator {
	return Migrator{
		keeper: k,
	}
}

// Migrate1to2 migrates the module state from version 1 to version 2.
// func (m Migrator) Migrate1to2(ctx context.Context) error {
// 	return v2.Migrate(/* migrations arguments */)
// }
