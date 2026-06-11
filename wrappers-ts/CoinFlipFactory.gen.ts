// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a CoinFlipFactory contract in Tolk.
/* eslint-disable */

import * as c from '@ton/core';
import { beginCell, ContractProvider, Sender, SendMode } from '@ton/core';

// ————————————————————————————————————————————
//   predefined types and functions
//

type StoreCallback<T> = (obj: T, b: c.Builder) => void
type LoadCallback<T> = (s: c.Slice) => T

export type CellRef<T> = {
    ref: T
}

function makeCellFrom<T>(self: T, storeFn_T: StoreCallback<T>): c.Cell {
    let b = beginCell();
    storeFn_T(self, b);
    return b.endCell();
}

function loadAndCheckPrefix32(s: c.Slice, expected: number, structName: string): void {
    let prefix = s.loadUint(32);
    if (prefix !== expected) {
        throw new Error(`Incorrect prefix for '${structName}': expected 0x${expected.toString(16).padStart(8, '0')}, got 0x${prefix.toString(16).padStart(8, '0')}`);
    }
}

function lookupPrefix(s: c.Slice, expected: number, prefixLen: number): boolean {
    return s.remainingBits >= prefixLen && s.preloadUint(prefixLen) === expected;
}

function throwNonePrefixMatch(fieldPath: string): never {
    throw new Error(`Incorrect prefix for '${fieldPath}': none of variants matched`);
}

function storeCellRef<T>(cell: CellRef<T>, b: c.Builder, storeFn_T: StoreCallback<T>): void {
    let b_ref = c.beginCell();
    storeFn_T(cell.ref, b_ref);
    b.storeRef(b_ref.endCell());
}

function loadCellRef<T>(s: c.Slice, loadFn_T: LoadCallback<T>): CellRef<T> {
    let s_ref = s.loadRef().beginParse();
    return { ref: loadFn_T(s_ref) };
}

function storeTolkNullable<T>(v: T | null, b: c.Builder, storeFn_T: StoreCallback<T>): void {
    if (v === null) {
        b.storeUint(0, 1);
    } else {
        b.storeUint(1, 1);
        storeFn_T(v, b);
    }
}

// ————————————————————————————————————————————
//   parse get methods result from a TVM stack
//

class StackReader {
    constructor(private tuple: c.TupleItem[]) {
    }

    static fromGetMethod(expectedN: number, getMethodResult: { stack: c.TupleReader }): StackReader {
        let tuple = [] as c.TupleItem[];
        while (getMethodResult.stack.remaining) {
            tuple.push(getMethodResult.stack.pop());
        }
        if (tuple.length !== expectedN) {
            throw new Error(`expected ${expectedN} stack width, got ${tuple.length}`);
        }
        return new StackReader(tuple);
    }

    private popExpecting<ItemT>(itemType: string): ItemT {
        const item = this.tuple.shift();
        if (item?.type === itemType) {
            return item as ItemT;
        }
        throw new Error(`not '${itemType}' on a stack`);
    }

    private popCellLike(): c.Cell {
        const item = this.tuple.shift();
        if (item && (item.type === 'cell' || item.type === 'slice' || item.type === 'builder')) {
            return item.cell;
        }
        throw new Error(`not cell/slice on a stack`);
    }

    readBigInt(): bigint {
        return this.popExpecting<c.TupleItemInt>('int').value;
    }

    readBoolean(): boolean {
        return this.popExpecting<c.TupleItemInt>('int').value !== 0n;
    }

    readCell(): c.Cell {
        return this.popCellLike();
    }

    readSlice(): c.Slice {
        return this.popCellLike().beginParse();
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint16 = bigint
type uint32 = bigint
type uint64 = bigint
type uint256 = bigint

/**
 > struct FactoryStorage {
 >     admin: address
 >     treasury: address
 >     feeBps: uint16
 >     minStake: coins
 >     maxStake: coins
 >     joinTimeout: uint32
 >     revealTimeout: uint32
 >     paused: bool
 >     gamesCount: uint64
 >     gameCode: cell
 > }
 */
export interface FactoryStorage {
    readonly $: 'FactoryStorage'
    admin: c.Address
    treasury: c.Address
    feeBps: uint16
    minStake: coins
    maxStake: coins
    joinTimeout: uint32
    revealTimeout: uint32
    paused: boolean
    gamesCount: uint64
    gameCode: c.Cell
}

export const FactoryStorage = {
    create(args: {
        admin: c.Address
        treasury: c.Address
        feeBps: uint16
        minStake: coins
        maxStake: coins
        joinTimeout: uint32
        revealTimeout: uint32
        paused: boolean
        gamesCount: uint64
        gameCode: c.Cell
    }): FactoryStorage {
        return {
            $: 'FactoryStorage',
            ...args
        }
    },
    fromSlice(s: c.Slice): FactoryStorage {
        return {
            $: 'FactoryStorage',
            admin: s.loadAddress(),
            treasury: s.loadAddress(),
            feeBps: s.loadUintBig(16),
            minStake: s.loadCoins(),
            maxStake: s.loadCoins(),
            joinTimeout: s.loadUintBig(32),
            revealTimeout: s.loadUintBig(32),
            paused: s.loadBoolean(),
            gamesCount: s.loadUintBig(64),
            gameCode: s.loadRef(),
        }
    },
    store(self: FactoryStorage, b: c.Builder): void {
        b.storeAddress(self.admin);
        b.storeAddress(self.treasury);
        b.storeUint(self.feeBps, 16);
        b.storeCoins(self.minStake);
        b.storeCoins(self.maxStake);
        b.storeUint(self.joinTimeout, 32);
        b.storeUint(self.revealTimeout, 32);
        b.storeBit(self.paused);
        b.storeUint(self.gamesCount, 64);
        b.storeRef(self.gameCode);
    },
    toCell(self: FactoryStorage): c.Cell {
        return makeCellFrom<FactoryStorage>(self, FactoryStorage.store);
    }
}

/**
 > struct (0xc0f10001) CreateGame {
 >     stake: coins
 >     commitment: uint256
 >     aSideHeads: bool
 > }
 */
export interface CreateGame {
    readonly $: 'CreateGame'
    stake: coins
    commitment: uint256
    aSideHeads: boolean
}

export const CreateGame = {
    PREFIX: 0xc0f10001,

    create(args: {
        stake: coins
        commitment: uint256
        aSideHeads: boolean
    }): CreateGame {
        return {
            $: 'CreateGame',
            ...args
        }
    },
    fromSlice(s: c.Slice): CreateGame {
        loadAndCheckPrefix32(s, 0xc0f10001, 'CreateGame');
        return {
            $: 'CreateGame',
            stake: s.loadCoins(),
            commitment: s.loadUintBig(256),
            aSideHeads: s.loadBoolean(),
        }
    },
    store(self: CreateGame, b: c.Builder): void {
        b.storeUint(0xc0f10001, 32);
        b.storeCoins(self.stake);
        b.storeUint(self.commitment, 256);
        b.storeBit(self.aSideHeads);
    },
    toCell(self: CreateGame): c.Cell {
        return makeCellFrom<CreateGame>(self, CreateGame.store);
    }
}

/**
 > struct (0xc0f10002) SetFee {
 >     feeBps: uint16
 > }
 */
export interface SetFee {
    readonly $: 'SetFee'
    feeBps: uint16
}

export const SetFee = {
    PREFIX: 0xc0f10002,

    create(args: {
        feeBps: uint16
    }): SetFee {
        return {
            $: 'SetFee',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetFee {
        loadAndCheckPrefix32(s, 0xc0f10002, 'SetFee');
        return {
            $: 'SetFee',
            feeBps: s.loadUintBig(16),
        }
    },
    store(self: SetFee, b: c.Builder): void {
        b.storeUint(0xc0f10002, 32);
        b.storeUint(self.feeBps, 16);
    },
    toCell(self: SetFee): c.Cell {
        return makeCellFrom<SetFee>(self, SetFee.store);
    }
}

/**
 > struct (0xc0f10003) SetLimits {
 >     minStake: coins
 >     maxStake: coins
 >     joinTimeout: uint32
 >     revealTimeout: uint32
 > }
 */
export interface SetLimits {
    readonly $: 'SetLimits'
    minStake: coins
    maxStake: coins
    joinTimeout: uint32
    revealTimeout: uint32
}

export const SetLimits = {
    PREFIX: 0xc0f10003,

    create(args: {
        minStake: coins
        maxStake: coins
        joinTimeout: uint32
        revealTimeout: uint32
    }): SetLimits {
        return {
            $: 'SetLimits',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetLimits {
        loadAndCheckPrefix32(s, 0xc0f10003, 'SetLimits');
        return {
            $: 'SetLimits',
            minStake: s.loadCoins(),
            maxStake: s.loadCoins(),
            joinTimeout: s.loadUintBig(32),
            revealTimeout: s.loadUintBig(32),
        }
    },
    store(self: SetLimits, b: c.Builder): void {
        b.storeUint(0xc0f10003, 32);
        b.storeCoins(self.minStake);
        b.storeCoins(self.maxStake);
        b.storeUint(self.joinTimeout, 32);
        b.storeUint(self.revealTimeout, 32);
    },
    toCell(self: SetLimits): c.Cell {
        return makeCellFrom<SetLimits>(self, SetLimits.store);
    }
}

/**
 > struct (0xc0f10004) SetTreasury {
 >     treasury: address
 > }
 */
export interface SetTreasury {
    readonly $: 'SetTreasury'
    treasury: c.Address
}

export const SetTreasury = {
    PREFIX: 0xc0f10004,

    create(args: {
        treasury: c.Address
    }): SetTreasury {
        return {
            $: 'SetTreasury',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetTreasury {
        loadAndCheckPrefix32(s, 0xc0f10004, 'SetTreasury');
        return {
            $: 'SetTreasury',
            treasury: s.loadAddress(),
        }
    },
    store(self: SetTreasury, b: c.Builder): void {
        b.storeUint(0xc0f10004, 32);
        b.storeAddress(self.treasury);
    },
    toCell(self: SetTreasury): c.Cell {
        return makeCellFrom<SetTreasury>(self, SetTreasury.store);
    }
}

/**
 > struct (0xc0f10005) SetPaused {
 >     paused: bool
 > }
 */
export interface SetPaused {
    readonly $: 'SetPaused'
    paused: boolean
}

export const SetPaused = {
    PREFIX: 0xc0f10005,

    create(args: {
        paused: boolean
    }): SetPaused {
        return {
            $: 'SetPaused',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetPaused {
        loadAndCheckPrefix32(s, 0xc0f10005, 'SetPaused');
        return {
            $: 'SetPaused',
            paused: s.loadBoolean(),
        }
    },
    store(self: SetPaused, b: c.Builder): void {
        b.storeUint(0xc0f10005, 32);
        b.storeBit(self.paused);
    },
    toCell(self: SetPaused): c.Cell {
        return makeCellFrom<SetPaused>(self, SetPaused.store);
    }
}

/**
 > struct (0xc0f10006) SetGameCode {
 >     code: cell
 > }
 */
export interface SetGameCode {
    readonly $: 'SetGameCode'
    code: c.Cell
}

export const SetGameCode = {
    PREFIX: 0xc0f10006,

    create(args: {
        code: c.Cell
    }): SetGameCode {
        return {
            $: 'SetGameCode',
            ...args
        }
    },
    fromSlice(s: c.Slice): SetGameCode {
        loadAndCheckPrefix32(s, 0xc0f10006, 'SetGameCode');
        return {
            $: 'SetGameCode',
            code: s.loadRef(),
        }
    },
    store(self: SetGameCode, b: c.Builder): void {
        b.storeUint(0xc0f10006, 32);
        b.storeRef(self.code);
    },
    toCell(self: SetGameCode): c.Cell {
        return makeCellFrom<SetGameCode>(self, SetGameCode.store);
    }
}

/**
 > struct (0xc0fe0001) EvGameCreated {
 >     gameId: uint64
 >     game: address
 >     creator: address
 >     stake: coins
 >     joinDeadline: uint32
 > }
 */
export interface EvGameCreated {
    readonly $: 'EvGameCreated'
    gameId: uint64
    game: c.Address
    creator: c.Address
    stake: coins
    joinDeadline: uint32
}

export const EvGameCreated = {
    PREFIX: 0xc0fe0001,

    create(args: {
        gameId: uint64
        game: c.Address
        creator: c.Address
        stake: coins
        joinDeadline: uint32
    }): EvGameCreated {
        return {
            $: 'EvGameCreated',
            ...args
        }
    },
    fromSlice(s: c.Slice): EvGameCreated {
        loadAndCheckPrefix32(s, 0xc0fe0001, 'EvGameCreated');
        return {
            $: 'EvGameCreated',
            gameId: s.loadUintBig(64),
            game: s.loadAddress(),
            creator: s.loadAddress(),
            stake: s.loadCoins(),
            joinDeadline: s.loadUintBig(32),
        }
    },
    store(self: EvGameCreated, b: c.Builder): void {
        b.storeUint(0xc0fe0001, 32);
        b.storeUint(self.gameId, 64);
        b.storeAddress(self.game);
        b.storeAddress(self.creator);
        b.storeCoins(self.stake);
        b.storeUint(self.joinDeadline, 32);
    },
    toCell(self: EvGameCreated): c.Cell {
        return makeCellFrom<EvGameCreated>(self, EvGameCreated.store);
    }
}

// ————————————————————————————————————————————
//    class CoinFlipFactory
//

interface ExtraSendOptions {
    bounce?: boolean                    // default: false
    sendMode?: SendMode                 // default: SendMode.PAY_GAS_SEPARATELY
    extraCurrencies?: c.ExtraCurrency   // default: empty dict
}

interface DeployedAddrOptions {
    workchain?: number                  // default: 0 (basechain)
    toShard?: { fixedPrefixLength: number; closeTo: c.Address }
    overrideContractCode?: c.Cell
}

function calculateDeployedAddress(code: c.Cell, data: c.Cell, options: DeployedAddrOptions): c.Address {
    const stateInitCell = beginCell().store(c.storeStateInit({
        code,
        data,
        splitDepth: options.toShard?.fixedPrefixLength,
        special: null,
        libraries: null,
    })).endCell();

    let addrHash = stateInitCell.hash();
    if (options.toShard) {
        const shardDepth = options.toShard.fixedPrefixLength;
        addrHash = beginCell()
            .storeBits(new c.BitString(options.toShard.closeTo.hash, 0, shardDepth))
            .storeBits(new c.BitString(stateInitCell.hash(), shardDepth, 256 - shardDepth))
            .endCell()
            .beginParse().loadBuffer(32);
    }

    return new c.Address(options.workchain ?? 0, addrHash);
}

export class CoinFlipFactory implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECDgEAAz8AART/APSkE/S88sgLAQIBYgIDBO7Q+JGRMOAg1ywmB4gADOMC1ywmB4gAFI5LMe1E0PpI+kjTDzH6APoA0x/TH9IA0z/U0fiSKccF8uBkCdcLDyCBA+i78uBpCMj6Uhf6UhfLD1AE+gJY+gLLH8sfEsoAyz/Mye1U4NcsJgeIABzjAtcsJgeIACTjAgQFBgcCAWoMDQH8Me1E0PpI+kjTD/oA+gDTH9Mf0gDTP9TRIvLQZgr6ANP/1woAUyi+lVMnu8MAkXDi8uBn+JcjghAF9eEAoL7y4GgjpAzI+lJSsPpSKs8LD1AJ+gJQB/oCJc8LHyTPCx8TygAZyz8pzxTJ7VT4I1ADoPgo+JIFyMv/GPpSySjICADUMe1E0PpI+kjTD/oAMfoAMdMfMdMfMdIA0z/U0fiSJscF8uBkBvoA+gDTH9cLHyPCAJRdu8MAkXDi8uBxIcIAlSDCAMMAkXDi8uBxCMj6Uhf6UhXLDwH6AlAD+gITyx8Tyx/KAMs/zMntVACEMe1E0PpI+kgx0w/6APoA0x/TH9IA0z/U0fiSKccF8uBkCfpIMAjI+lIY+lIWyw9QBPoCWPoCyx/LH8oAyz/Mye1UArSJ1yeOQzHtRND6SPpI0w/6APoA0x/TH9IAMdM/1NH4kinHBfLgZAnXCgAIyPpSF/pSFcsPUAP6AgH6Assfyx8SygDLP8zJ7VTg1ywmB4gANOMCMIQPAccA8vQKCwH8yz8Y+lIU+lIi+gIUygAUyw8Syx8hzwsfE8zJbQHIzM+EAvpUcM8L/8+QAAAAAslTBMjPhNDMzPkWyM+KAEDL/89Q+JLIz5MD+AAGFss/+lIU+lIB+gLLH8nIz48YAARxzwv3cc8LYczJcPsAyM+JCAFTEsjPhNDMzPkWzwv/CQAcgQCMzwt0EszMyYBA+wAACMDxAAUAhDHtRND6SPpI0w/6APoA0x/TH9IA0z/UMdH4kinHBfLgZAnXTAjI+lIX+lIVyw9QA/oCAfoCyx/LH8oAEss/zMntVABFtTfdqJofSQY/SQY6YeY/QAY/QAY6Y+Y6Y+Y6QAY6Z/qGOjAAM7R+HaiaH0kfSRph/0AfQBpj+mP6QBpn+pow');

    static Errors = {
        'Errors.NotAdmin': 100,
        'Errors.GamePaused': 102,
        'Errors.InvalidStake': 103,
        'Errors.InsufficientValue': 104,
        'Errors.FeeTooHigh': 105,
        'Errors.InvalidLimits': 113,
        'Errors.InvalidMessage': 65535,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new CoinFlipFactory(address);
    }

    static fromStorage(emptyStorage: {
        admin: c.Address
        treasury: c.Address
        feeBps: uint16
        minStake: coins
        maxStake: coins
        joinTimeout: uint32
        revealTimeout: uint32
        paused: boolean
        gamesCount: uint64
        gameCode: c.Cell
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? CoinFlipFactory.CodeCell,
            data: FactoryStorage.toCell(FactoryStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new CoinFlipFactory(address, initialState);
    }

    static createCellOfCreateGame(body: {
        stake: coins
        commitment: uint256
        aSideHeads: boolean
    }) {
        return CreateGame.toCell(CreateGame.create(body));
    }

    static createCellOfSetFee(body: {
        feeBps: uint16
    }) {
        return SetFee.toCell(SetFee.create(body));
    }

    static createCellOfSetLimits(body: {
        minStake: coins
        maxStake: coins
        joinTimeout: uint32
        revealTimeout: uint32
    }) {
        return SetLimits.toCell(SetLimits.create(body));
    }

    static createCellOfSetTreasury(body: {
        treasury: c.Address
    }) {
        return SetTreasury.toCell(SetTreasury.create(body));
    }

    static createCellOfSetPaused(body: {
        paused: boolean
    }) {
        return SetPaused.toCell(SetPaused.create(body));
    }

    static createCellOfSetGameCode(body: {
        code: c.Cell
    }) {
        return SetGameCode.toCell(SetGameCode.create(body));
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendCreateGame(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        stake: coins
        commitment: uint256
        aSideHeads: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CreateGame.toCell(CreateGame.create(body)),
            ...extraOptions
        });
    }

    async sendSetFee(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        feeBps: uint16
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetFee.toCell(SetFee.create(body)),
            ...extraOptions
        });
    }

    async sendSetLimits(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        minStake: coins
        maxStake: coins
        joinTimeout: uint32
        revealTimeout: uint32
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetLimits.toCell(SetLimits.create(body)),
            ...extraOptions
        });
    }

    async sendSetTreasury(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        treasury: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetTreasury.toCell(SetTreasury.create(body)),
            ...extraOptions
        });
    }

    async sendSetPaused(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        paused: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetPaused.toCell(SetPaused.create(body)),
            ...extraOptions
        });
    }

    async sendSetGameCode(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        code: c.Cell
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SetGameCode.toCell(SetGameCode.create(body)),
            ...extraOptions
        });
    }

    async getFactoryData(provider: ContractProvider): Promise<FactoryStorage> {
        const r = StackReader.fromGetMethod(10, await provider.get('factoryData', []));
        return ({
            $: 'FactoryStorage',
            admin: r.readSlice().loadAddress(),
            treasury: r.readSlice().loadAddress(),
            feeBps: r.readBigInt(),
            minStake: r.readBigInt(),
            maxStake: r.readBigInt(),
            joinTimeout: r.readBigInt(),
            revealTimeout: r.readBigInt(),
            paused: r.readBoolean(),
            gamesCount: r.readBigInt(),
            gameCode: r.readCell(),
        });
    }

    async getGamesCount(provider: ContractProvider): Promise<bigint> {
        const r = StackReader.fromGetMethod(1, await provider.get('gamesCount', []));
        return r.readBigInt();
    }
}
