import 'improved-map';

import {
    Map_Context,
    Array_Context,
    Encoder,
    Decoder,
    inspect,
    Bits,
    Uint,
    Int,
    Float,
    Utf8,
    Embed,
    Binary_Array,
    Binary_Map,
    Byte_Buffer,
    Repeat,
    Branch,
    Padding
} from '../src/transcode';

// TODO: Test packing with insufficient input data
// TODO: Test parsing with insufficient ArrayBuffer

describe("Bits", () => {
    describe("parsing", () => {
        test("simplest cases", () => {
            const data_view = new DataView(new Uint8Array([0xFF]).buffer);
            expect(Bits(1).parse(data_view)).toEqual({size: 1/8, data: 1});
            expect(Bits(2).parse(data_view)).toEqual({size: 2/8, data: 3});
            expect(Bits(3).parse(data_view)).toEqual({size: 3/8, data: 7});
            expect(Bits(4).parse(data_view)).toEqual({size: 4/8, data: 15});
            expect(Bits(5).parse(data_view)).toEqual({size: 5/8, data: 31});
            expect(Bits(6).parse(data_view)).toEqual({size: 6/8, data: 63});
            expect(Bits(7).parse(data_view)).toEqual({size: 7/8, data: 127});
        });
    });
    describe("packing", () => {
        describe("given DataView", () => {
            // TODO
        });
        describe("given no DataView", () => {
            // TODO
        });
    });
    describe("bad size", () => {
        // TODO
    });
});
describe("Uint", () => {
    test("simplest parse cases", () => {
        const data_view = new DataView(new ArrayBuffer(4));
        data_view.setUint8(0, 6);
        expect(Uint(8).parse(data_view)).toEqual({data: 6, size: 1});
        data_view.setUint16(0, 8128);
        expect(Uint(16).parse(data_view)).toEqual({data: 8128, size: 2});
        data_view.setUint32(0, 33550336);
        expect(Uint(32).parse(data_view)).toEqual({data: 33550336, size: 4});
    });
    test("parsing endianness", () => {
        const data_view = new DataView(new ArrayBuffer(4));
        const little_endian = true;
        data_view.setUint16(0, 8128, little_endian);
        expect(Uint(16, {little_endian}).parse(data_view)).toEqual({data: 8128, size: 2});
        data_view.setUint32(0, 33550336, little_endian);
        expect(Uint(32).parse(data_view, {little_endian})).toEqual({data: 33550336, size: 4});
    });
    test("Uint64 parsing", () => {
        const now = Date.now();
        const lower = now % 2 ** 32;
        const upper = Math.floor(now / 2 ** 32);
        const data_view = new DataView(new Uint32Array([lower, upper]).buffer);
        expect(Uint(64, {little_endian: true}).parse(data_view)).toEqual({data: now, size: 8});
        data_view.setUint32(0, upper);
        data_view.setUint32(4, lower);
        expect(Uint(64).parse(data_view)).toEqual({data: now, size: 8});
    });
    describe("given data_view", () => {
        test("simplest pack case", () => {
            const data_view = new DataView(new ArrayBuffer(4));
            Uint(8).pack(6, {data_view});
            expect(data_view.getUint8(0)).toEqual(6);
            Uint(16).pack(8128, {data_view});
            expect(data_view.getUint16(0)).toEqual(8128);
            Uint(32).pack(33550336, {data_view});
            expect(data_view.getUint32(0)).toEqual(33550336);
        });
        test("packing endianness", () => {
            const data_view = new DataView(new ArrayBuffer(4));
            const little_endian = true;
            Uint(16, {little_endian}).pack(8128, {data_view});
            expect(data_view.getUint16(0, little_endian)).toEqual(8128);
            Uint(32).pack(33550336, {little_endian, data_view});
            expect(data_view.getUint32(0, little_endian)).toEqual(33550336);
        });
        test("Uint64 packing", () => {
            const now = Date.now();
            const lower = now % 2 ** 32;
            const upper = Math.floor(now / 2 ** 32);
            const data_view = new DataView(new ArrayBuffer(8));
            Uint(64, {little_endian: true}).pack(now, {data_view});
            expect(Array.from(new Uint32Array(data_view.buffer))).toEqual([lower, upper]);
            Uint(64).pack(now, {data_view});
            expect(data_view.getUint32(0)).toEqual(upper);
            expect(data_view.getUint32(4)).toEqual(lower);
        });
    });
    describe("without data_view given", () => {
        test("simplest pack case", () => {
            let size, buffer;
            ({size, buffer} = Uint(8).pack(6));
            expect(size).toEqual(1);
            expect(new DataView(buffer).getUint8(0)).toEqual(6);
            ({size, buffer} = Uint(16).pack(8128));
            expect(size).toEqual(2);
            expect(new DataView(buffer).getUint16(0)).toEqual(8128);
            ({size, buffer} = Uint(32).pack(33550336));
            expect(size).toEqual(4);
            expect(new DataView(buffer).getUint32(0)).toEqual(33550336);
        });
        test("packing endianness", () => {
            let size, buffer;
            const little_endian = true;
            ({size, buffer} = Uint(16, {little_endian}).pack(8128));
            expect(size).toEqual(2);
            expect(new DataView(buffer).getUint16(0, little_endian)).toEqual(8128);
            ({size, buffer} = Uint(32).pack(33550336, {little_endian}));
            expect(size).toEqual(4);
            expect(new DataView(buffer).getUint32(0, little_endian)).toEqual(33550336);
        });
        test("Uint64 packing", () => {
            let size, buffer;
            const now = Date.now();
            const lower = now % 2 ** 32;
            const upper = Math.floor(now / 2 ** 32);
            ({size, buffer} = Uint(64, {little_endian: true}).pack(now));
            expect(size).toEqual(8);
            expect(Array.from(new Uint32Array(buffer))).toEqual([lower, upper]);
            ({size, buffer} = Uint(64).pack(now));
            expect(size).toEqual(8);
            const data_view = new DataView(buffer);
            expect(data_view.getUint32(0)).toEqual(upper);
            expect(data_view.getUint32(4)).toEqual(lower);
        });
    });
});
describe("Int", () => {
    describe("parsing", () => {
        // TODO
    });
    describe("packing", () => {
        describe("given DataView", () => {
            // TODO
        });
        describe("given no DataView", () => {
            // TODO
        });
    });
    describe("bad size", () => {
        // TODO
    });
});
describe("Float", () => {
    describe("parsing", () => {
        // TODO
    });
    describe("packing", () => {
        describe("given DataView", () => {
            // TODO
        });
        describe("given no DataView", () => {
            // TODO
        });
    });
    describe("bad size", () => {
        // TODO
    });
});
describe("Utf8", () => {
    describe("parsing", () => {
        // TODO
    });
    describe("packing", () => {
        describe("given DataView", () => {
            // TODO
        });
        describe("given no DataView", () => {
            // TODO
        });
    });
    describe("bad size", () => {
        // TODO
    });
});
describe("Branch", () => {
    describe("parsing", () => {
        test("simple case", () => {
            const data_view = new DataView(new Uint8Array([1, 0xAB, 0xCD]).buffer);
            const binary_array = Binary_Array(Uint(8), Branch({chooser: (context: Array<number>) => context[0], choices: {1: Uint(16, {little_endian: true}), 2: Uint(16)}}));
            expect(binary_array.parse(data_view)).toEqual({data: [1, 0xCDAB], size: 3});
            data_view.setUint8(0, 2);
            expect(binary_array.parse(data_view)).toEqual({data: [2, 0xABCD], size: 3});
        });
        test("default value", () => {
            const data_view = new DataView(new Uint8Array([42, 0xAB, 0xCD]).buffer);
            const binary_array = Binary_Array(Uint(8), Branch({chooser: (context: Array<number>) => context[0], choices: {1: Uint(16, {little_endian: true})}, default_choice: Uint(16)}));
            expect(binary_array.parse(data_view)).toEqual({data: [42, 0xABCD], size: 3});
        });
        test("bad choice", () => {
            const data_view = new DataView(new Uint8Array([42, 0xAB, 0xCD]).buffer);
            const binary_array = Binary_Array(Uint(8), Branch({chooser: (context: Array<number>) => context[0], choices: {1: Uint(16, {little_endian: true}), 2: Uint(16)}}));
            expect(() => binary_array.parse(data_view)).toThrow(/Choice 42 not in/);
        });
    });
    describe("Packing", () => {
        // TODO
    });
});
describe("Padding", () => {
    describe("parsing", () => {
        test("simple case", () => {
            const data_view = new DataView(new Uint8Array([1, 0, 0xAA]).buffer);
            const binary_array = Binary_Array(Uint(8), Padding({bytes: 1}), Uint(8));
            expect(binary_array.parse(data_view)).toEqual({data: [1, 0xAA], size: 3});
            binary_array[1] = Padding({bytes: 1, bits: 4});
            binary_array[2] = Bits(4);
            expect(binary_array.parse(data_view)).toEqual({data: [1, 0xA], size: 3});
        });
        test("size function", () => {
            const data_view = new DataView(new Uint8Array([8, 0, 0xAA, 0xBB]).buffer);
            const binary_array = Binary_Array(Uint(8), Padding((ctx: Array<number>) => ctx[0]), Uint(8));
            expect(binary_array.parse(data_view)).toEqual({data: [8, 0xAA], size: 3});
            data_view.setUint8(0, 12);
            expect(binary_array.parse(data_view)).toEqual({data: [12, 0xBA], size: 3.5});
            data_view.setUint8(0, 0);
            expect(binary_array.parse(data_view)).toEqual({data: [0, 0], size: 2});
        });
        test("decode", () => {
            const data_view = new DataView(new Uint8Array([12, 0xFF, 0xAF]).buffer);
            const binary_array = Binary_Array(Uint(8), Padding((ctx: Array<number>) => ctx[0], {decode: (_, ctx: Array<number>) => `Padding of ${ctx[0]} bits`}), Bits(4));
            expect(binary_array.parse(data_view)).toEqual({data: [12, 'Padding of 12 bits', 0xA], size: 3})
        });
    });
    describe("Packing", () => {
        describe("Given DataView", () => {
            // TODO
        });
        describe("Given no DataView", () => {
            test("bytes & bits", () => {
                const binary_array = Binary_Array(Uint(8), Padding({bytes: 1, bits: 4}), Bits(4), Uint(8));
                const {size, buffer} = binary_array.pack([1, 0xA, 2]);
                expect(size).toEqual(4);
                expect(Array.from(new Uint8Array(buffer))).toEqual([1, 0, 0xA0, 2]);
            });
            test("size function", () => {
                const binary_array = Binary_Array(Uint(8), Padding((ctx: Array<number>) => ctx[0]), Bits(4));
                const {size, buffer} = binary_array.pack([12, 0xA]);
                expect(size).toEqual(3);
                expect(Array.from(new Uint8Array(buffer))).toEqual([12, 0, 0xA0]);
            });
            test("fill value via encode", () => {
                const binary_array = Binary_Array(Uint(8), Padding(12, {encode: () => 0xFFFF}), Bits(4));
                const {size, buffer} = binary_array.pack([1, 0xA]);
                expect(size).toEqual(3);
                expect(Array.from(new Uint8Array(buffer))).toEqual([1, 0xFF, 0xAF]);
            });
            test("size of zero", () => {
                const binary_array = Binary_Array(Padding(0));
                const {size, buffer} = binary_array.pack([]);
                expect(size).toEqual(0);
                expect(buffer.byteLength).toEqual(0);
            });
        });
    });
});
describe("Binary_Array", () => {
    describe("Parsing", () => {
        test("parse a single byte", () => {
            const data_view = new DataView(new Uint8Array([42]).buffer);
            const binary_array = Binary_Array(Uint(8));
            expect(binary_array.parse(data_view)).toEqual({data: [42], size: 1})
        });
        test("setting endianness various ways", () => {
            const now = Date.now();
            const lower = now % 2 ** 32;
            const upper = Math.floor(now / 2 ** 32);
            const data_view = new DataView(new Uint32Array([lower, upper]).buffer);
            let binary_array = Binary_Array({little_endian: true}, Uint(64));
            expect(binary_array.parse(data_view)).toEqual({data: [now], size: 8});
            binary_array = Binary_Array(Uint(64));
            expect(binary_array.parse(data_view, {little_endian: true})).toEqual({data: [now], size: 8});
        });
        test("nested repeat", () => {
            const data_view = new DataView(new Uint8Array([0, 1, 2, 3, 4]).buffer);
            const binary_array = Binary_Array(Uint(8), Repeat(Uint(8), {count: 3}), Uint(8));
            expect(binary_array.parse(data_view)).toEqual({data: [0, [1, 2, 3], 4], size: 5});
        });
    });
    describe("Packing", () => {
        describe("Given DataView", () => {
            test("pack some bytes", () => {
                const binary_array = Binary_Array(Uint(8), Uint(8), Uint(8));
                const data_view = new DataView(new ArrayBuffer(3));
                const {size, buffer} = binary_array.pack([41, 42, 170], {data_view});
                expect(size).toEqual(3);
                expect(Array.from(new Uint8Array(buffer))).toEqual([41, 42, 170]);
            });
            test("nest an array", () => {
                const binary_array = Binary_Array(Uint(8), Binary_Array(Uint(8), Uint(8)), Uint(8));
                const data_view = new DataView(new ArrayBuffer(4));
                const {size, buffer} = binary_array.pack([1, [11, 12], 3], {data_view});
                expect(size).toEqual(4);
                expect(Array.from(new Uint8Array(buffer))).toEqual([1, 11, 12, 3]);
            });
            test("pack some bits & bytes", () => {
                const binary_array = Binary_Array(Bits(2), Uint(8), Uint(8), Bits(6));
                const data_view = new DataView(new ArrayBuffer(3));
                const {size, buffer} = binary_array.pack([2, 170, 170, 42], {data_view});
                expect(size).toEqual(3);
                expect(Array.from(new Uint8Array(buffer))).toEqual([0xAA, 0xAA, 0xAA]);
            });
        });
        describe("Given no DataView", () => {
            test("pack some bytes", () => {
                const binary_array = Binary_Array(Uint(8), Uint(8), Uint(8));
                const {size, buffer} = binary_array.pack([41, 42, 170]);
                expect(size).toEqual(3);
                expect(Array.from(new Uint8Array(buffer))).toEqual([41, 42, 170]);
            });
            test("nest an array", () => {
                const binary_array = Binary_Array(Uint(8), Binary_Array(Uint(8), Uint(8)), Uint(8));
                const {size, buffer} = binary_array.pack([1, [11, 12], 3]);
                expect(size).toEqual(4);
                expect(Array.from(new Uint8Array(buffer))).toEqual([1, 11, 12, 3]);
            });
            test("pack some bits & bytes", () => {
                const binary_array = Binary_Array(Bits(2), Uint(8), Uint(8), Bits(6));
                const {size, buffer} = binary_array.pack([2, 170, 170, 42]);
                expect(size).toEqual(3);
                expect(Array.from(new Uint8Array(buffer))).toEqual([0xAA, 0xAA, 0xAA]);
            });
        });
    });
    test("Binary_Array mutability as an array", () => {
        const array = [0, 1, 2];
        const data_view = new DataView(new Uint8Array(array).buffer);
        const binary_array = Binary_Array();
        expect(binary_array.parse(data_view)).toEqual({data: [], size: 0});
        binary_array.push(Uint(8));
        expect(binary_array.parse(data_view)).toEqual({data: [0], size: 1});
        binary_array.push(Uint(8), Uint(8));
        expect(binary_array.parse(data_view)).toEqual({data: [0, 1, 2], size: 3});
        binary_array.shift();
        binary_array.pop();
        expect(binary_array.parse(data_view)).toEqual({data: [0], size: 1});
        binary_array.push(Uint(16, {little_endian: true}));
        expect(binary_array.parse(data_view)).toEqual({data: [0, 0x0201], size: 3});
    });
});
describe("Repeat", () => {
    describe("Parsing", () => {
        test("simple count case", () => {
            const data_view = new DataView(new Uint8Array([6, 5, 4, 3, 2, 1]).buffer);
            const repeat = Repeat({count: 3}, Uint(8), Uint(8));
            expect(repeat.parse(data_view)).toEqual({data: [6, 5, 4, 3, 2, 1], size: 6});
        });
        test("trivial bytes function case", () => {
            const data_view = new DataView(new Uint8Array([6, 5, 4, 3, 2, 1]).buffer);
            const repeat = Repeat({bytes: () => 6}, Uint(8), Uint(8), Uint(8));
            expect(repeat.parse(data_view)).toEqual({data: [6, 5, 4, 3, 2, 1], size: 6});
        });
        test("error in bytes size", () => {
            const data_view = new DataView(new Uint8Array([6, 5, 4, 3, 2, 1]).buffer);
            const repeat = Repeat({bytes: 5}, Uint(16));
            expect(() => repeat.parse(data_view)).toThrow(/Cannot parse exactly/);
        });
    });
    describe("Packing", () => {
        test("Given DataView", () => {
            const array = [6, 5, 4, 3, 2, 1];
            const bytes = new Uint8Array(6);
            const data_view = new DataView(bytes.buffer);
            const repeat = Repeat({count: 6}, Uint(8));
            repeat.pack(array, {data_view});
            expect(Array.from(bytes)).toEqual(array);
        });
        test("Given no DataView", () => {
            const array = [6, 5, 4, 3, 2, 1];
            const repeat = Repeat({bytes: 6}, Uint(8));
            const {size, buffer} = repeat.pack(array);
            expect(size).toEqual(array.length);
            expect(Array.from(new Uint8Array(buffer))).toEqual(array);
        });
        test("Error in Bytes size", () => {
            const array = [6, 5, 4, 3, 2, 1];
            const repeat = Repeat({bytes: 5}, Uint(16));
            expect(() => repeat.pack(array)).toThrow(/Cannot pack into/);
        });
    });
});
describe("Binary_Map", () => {
    describe("Parsing", () => {
        const decode = Binary_Map.object_decoder;
        test("parse a byte", () => {
            const data_view = new DataView(new Uint8Array([42]).buffer);
            const binary_map = Binary_Map({decode}).set('a_byte', Uint(8));
            expect(binary_map.parse(data_view)).toEqual({data: {a_byte: 42}, size: 1});
        });
        test("setting endianness", () => {
            const now = Date.now();
            const lower = now % 2 ** 32;
            const upper = Math.floor(now / 2 ** 32);
            const data_view = new DataView(new Uint32Array([lower, upper]).buffer);
            let binary_map = Binary_Map({decode, little_endian: true}).set('now', Uint(64));
            expect(binary_map.parse(data_view)).toEqual({data: {now: now}, size: 8});
            binary_map = Binary_Map({decode}).set('now', Uint(64, {little_endian: true}));
            expect(binary_map.parse(data_view)).toEqual({data: {now: now}, size: 8});
        });
    });
    describe("Packing", () => {
        describe("Given DataView", () => {
            test("pack a byte", () => {
                const binary_map = Binary_Map().set('one', Uint(8));
                const data_view = new DataView(new ArrayBuffer(1));
                binary_map.pack(new Map([['one', 42]]), {data_view});
                expect(data_view.getUint8(0)).toEqual(42);
            });
        });
        describe("Given no DataView", () => {
            test("pack data from an object", () => {
                const now = Date.now();
                const lower = now % 2 ** 32;
                const upper = Math.floor(now / 2 ** 32);
                const binary_map = Binary_Map(Binary_Map.object_transcoders).set('one', Uint(8)).set('now', Uint(64, {little_endian: true}));
                const {size, buffer} = binary_map.pack({one: 1, now: now});
                expect(size).toEqual(9);
                expect(Array.from(new Uint8Array(buffer))).toEqual([1, ...new Uint8Array(new Uint32Array([lower, upper]).buffer)]);
            });
            // TODO
        });
    });
});
describe("Byte_Buffer", () => {
    describe("Parsing", () => {
        test("simple case", () => {
            const byte_buffer = Byte_Buffer(4);
            const data_view = new DataView(new Uint8Array([0, 1, 2, 3]).buffer);
            expect(byte_buffer.parse(data_view)).toEqual({data: data_view.buffer, size: 4})
        });
        test("in a Binary_Array", () => {
            const data_view = new DataView(new Uint8Array([0, 1, 2, 3, 4]).buffer);
            const binary_array = Binary_Array(Uint(8), Byte_Buffer((ctx: Array<number>) => ctx[0]!, {decode: (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer))}));
            for (let i = 1; i < 5; i++) {
                data_view.setUint8(0, i);
                expect(binary_array.parse(data_view)).toEqual({data: [i, [1, 2, 3, 4].slice(0, i)], size: i + 1});
            }
        });
    });
    describe("Packing", () => {
        describe("Given DataView", () => {
            const array = new Uint8Array([1, 2, 3, 4]);
            const buffer = new ArrayBuffer(4);
            const data_view = new DataView(buffer);
            const byte_buffer = Byte_Buffer(4);
            byte_buffer.pack(array.buffer, {data_view});
            expect(Array.from(new Uint8Array(buffer))).toEqual(Array.from(array));
        });
        describe("Given no DataView", () => {
            const array = new Uint8Array([1, 2, 3, 4]);
            const byte_buffer = Byte_Buffer(4);
            const {size, buffer} = byte_buffer.pack(array.buffer);
            expect(size).toEqual(4);
            expect(Array.from(new Uint8Array(buffer))).toEqual(Array.from(array));
        });
    });
});
describe("Embed", () => {
    describe("Parsing", () => {
        const decode = <T>(data: Map<string, T>) => data.toObject();
        test("simple case: embed struct in array and map", () => {
            const data_view = new DataView(new Uint8Array([0, 1]).buffer);
            const binary_array = Binary_Array(Uint(8), Embed(Uint(8)));
            const binary_map = Binary_Map({decode}).set('a', Uint(8)).set('b', Embed(Uint(8)));
            expect(binary_array.parse(data_view)).toEqual({data: [0, 1], size: 2});
            expect(binary_map.parse(data_view)).toEqual({data: {a: 0, b: 1}, size: 2});
        });
        test("array embedded in array", () => {
            const data_view = new DataView(new Uint8Array([0, 1, 2, 3]).buffer);
            const binary_array = Binary_Array(Uint(8), Embed(Binary_Array(Uint(8), Uint(8))), Uint(8));
            expect(binary_array.parse(data_view)).toEqual({data: [0, 1, 2, 3], size: 4});
        });
        test("repeat embedded in array", () => {
            const data_view = new DataView(new Uint8Array([0, 1, 2, 3, 4]).buffer);
            const binary_array = Binary_Array(Uint(8), Embed(Repeat(Uint(8), {count: 3})), Uint(8));
            expect(binary_array.parse(data_view)).toEqual({data: [0, 1, 2, 3, 4], size: 5});
        });
        test("embedded maps", () => {
            const data_view = new DataView(new Uint8Array([0, 1, 2, 3]).buffer);
            const binary_map = Binary_Map({decode}).set('a', Uint(8)).set('embedded', Embed(Binary_Map().set('b', Uint(8)).set('c', Uint(8)))).set('d', Uint(8));
            expect(binary_map.parse(data_view)).toEqual({data: {a: 0, b: 1, c: 2, d: 3}, size: 4});
        });
        test("embed branch containing Uint(8) in array and map", () => {
            const data_view = new DataView(new Uint8Array([0, 1]).buffer);
            const binary_array = Binary_Array(Uint(8), Branch({
                chooser: (ctx: Array_Context) => ctx[0],
                choices: {0: Uint(8)}
            }));
            const binary_map = Binary_Map({decode}).set('a', Uint(8)).set('embed', Branch({
                chooser: (ctx: Map_Context) => ctx.get('a'),
                choices: {0: Uint(8)}
            }));
            expect(binary_array.parse(data_view)).toEqual({data: [0, 1], size: 2});
            expect(binary_map.parse(data_view)).toEqual({data: {a: 0, embed: 1}, size: 2});
        });
        test("embed array in branch of array", () => {
            const data_view = new DataView(new Uint8Array([0, 1]).buffer);
            const binary_array = Binary_Array(Uint(8), Branch({
                chooser: (ctx: Array_Context) => ctx[0],
                choices: {0: Embed(Binary_Array(Uint(8)))}
            }));
            expect(binary_array.parse(data_view)).toEqual({data: [0, 1], size: 2});
        });
        test("embed map in branch of map", () => {
            const data_view = new DataView(new Uint8Array([0, 1]).buffer);
            const binary_map = Binary_Map({decode}).set('a', Uint(8)).set('embed', Branch({
                chooser: (ctx: Map_Context) => ctx.get('a'),
                choices: {0: Embed(Binary_Map().set('b', Uint(8)))}
            }));
            expect(binary_map.parse(data_view)).toEqual({data: {a: 0, b: 1}, size: 2});
        });
    });
    describe("Packing", () => {
        test("array embedded in array given data_view", () => {
            const binary_array = Binary_Array(Uint(8), Embed(Binary_Array(Uint(8), Uint(8))), Uint(8));
            const data_view = new DataView(new ArrayBuffer(4));
            const {size, buffer} = binary_array.pack([6, 28, 41, 127], {data_view});
            expect(size).toEqual(4);
            expect(Array.from(new Uint8Array(buffer))).toEqual([6, 28, 41, 127]);
        });
        test("array embedded in array not given data_view", () => {
            const binary_array = Binary_Array(Uint(8), Embed(Binary_Array(Uint(8), Uint(8))), Uint(8));
            const {size, buffer} = binary_array.pack([6, 28, 41, 127]);
            expect(size).toEqual(4);
            expect(Array.from(new Uint8Array(buffer))).toEqual([6, 28, 41, 127]);
        });
    });
});
