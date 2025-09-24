import { Random } from '../Random.node';
import { IExecuteFunctions } from 'n8n-workflow';

// Cria um mock do contexto do n8n
function createMockExecuteFunctions(randomApiResponse: string): IExecuteFunctions {
	return {
		getNodeParameter: jest.fn((paramName: string) => {
			if (paramName === 'operation') return 'trueRandom';
			if (paramName === 'min') return 1;
			if (paramName === 'max') return 10;
			return undefined;
		}),
		helpers: {
			httpRequest: jest.fn().mockResolvedValue(randomApiResponse),
			returnJsonArray: (items: any[]) => items.map((item) => ({ json: item })),
		},
		getNode: jest.fn(),
	} as unknown as IExecuteFunctions;
}

describe('Random Node', () => {
	it('should return a random number from Random.org response', async () => {
		// Simula que a API respondeu "7\n"
		const mockResponse = '7\n';
		const mockExecuteFunctions = createMockExecuteFunctions(mockResponse);

		const node = new Random();
		const result = await node.execute.call(mockExecuteFunctions);

		// Espera que o resultado tenha o número aleatório retornado
		expect(result[0][0].json).toEqual({ randomNumber: 7 });

		// Verifica que o httpRequest foi chamado
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalled();
	});

	it('should throw an error if min > max', async () => {
		const mockExecuteFunctions = {
			...createMockExecuteFunctions('5'),
			getNodeParameter: jest.fn((paramName: string) => {
				if (paramName === 'operation') return 'trueRandom';
				if (paramName === 'min') return 10;
				if (paramName === 'max') return 1;
				return undefined;
			}),
		} as unknown as IExecuteFunctions;

		const node = new Random();

		await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
			'O valor mínimo não pode ser maior que o valor máximo.'
		);
	});
});
