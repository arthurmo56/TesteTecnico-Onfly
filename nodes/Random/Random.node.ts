import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class Random implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Random',
		name: 'random',
		icon: 'file:random.svg',
		group: ['transform'],
		version: 1,
		description: 'Gera números aleatórios usando Random.org',
		defaults: {
			name: 'Random',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'True Random Number Generator',
						value: 'trueRandom',
						description: 'Gera um número aleatório usando Random.org',
						action: 'Gera um numero aleatorio usando random org',
					},
				],
				default: 'trueRandom',
			},
			{
				displayName: 'Min',
				name: 'min',
				type: 'number',
				typeOptions: {
					minValue: -1_000_000,
					maxValue: 1_000_000,
				},
				required: true,
				default: 1,
				description: 'Valor mínimo',
                displayOptions: {
                    show: {
                        operation: ['trueRandom'],
                    },
                },
			},
			{
				displayName: 'Max',
				name: 'max',
				type: 'number',
				typeOptions: {
					minValue: -1_000_000,
					maxValue: 1_000_000,
				},
				required: true,
				default: 100,
				description: 'Valor máximo',
                displayOptions: {
                    show: {
                        operation: ['trueRandom'],
                    },
                },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const operation = this.getNodeParameter('operation', 0) as string;

		if (operation === 'trueRandom') {
			try {
				const min = this.getNodeParameter('min', 0) as number;
				const max = this.getNodeParameter('max', 0) as number;

				// validações extras
				if (!Number.isInteger(min) || !Number.isInteger(max)) {
					throw new NodeOperationError(this.getNode(), 'Os valores devem ser inteiros.');
				}
				if (min > max) {
					throw new NodeOperationError(
						this.getNode(),
						'O valor mínimo não pode ser maior que o valor máximo.',
					);
				}

				// monta URL do Random.org
				const url = `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;

				// usa helper do n8n
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url,
					json: false,
				});

				const randomNumber = parseInt(response as string, 10);

				if (isNaN(randomNumber)) {
					throw new NodeOperationError(this.getNode(), 'Resposta inválida da API Random.org.');
				}

				return [this.helpers.returnJsonArray([{ randomNumber }])];
			} catch (error) {
				if (error instanceof NodeOperationError) throw error;
				throw new NodeOperationError(this.getNode(), `Erro ao gerar número: ${error}`);
			}
		}

		// fallback se operação não for reconhecida (não deveria acontecer)
		throw new NodeOperationError(this.getNode(), 'Operação não suportada.');
	}
}
