import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { render, screen } from './test/test-utils';
import userEvent from '@testing-library/user-event';
import App from './App';

export const handlers = [
	rest.get('http://localhost:7000/todos', (req, res, ctx) => {
		return res(
			ctx.json([
				{
					id: 1,
					title: 'todo 1',
					completed: true,
				},
				{
					id: 2,
					title: 'todo 2',
					completed: false,
				},
				{
					id: 3,
					title: 'todo 3',
					completed: true,
				},
			]),
			ctx.delay(150)
		);
	}),
	rest.post('http://localhost:7000/todos', (req, res, ctx) => {
		return res(
			ctx.json({
				id: 4,
				title: 'attend apple event',
				completed: false,
			}),
			ctx.delay(150)
		);
	}),
	rest.delete('http://localhost:7000/todos/1', (req, res, ctx) => {
		return res(
			ctx.json([
				{
					id: 2,
					title: 'todo 2',
					completed: false,
				},
				{
					id: 3,
					title: 'todo 3',
					completed: true,
				},
			]),
			ctx.delay(150)
		);
	}),
];

const server = setupServer(...handlers);

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done.
afterAll(() => server.close());

describe('should render a todo list', () => {
	test('fetches & receives a todo list', async () => {
		render(<App />);

		expect(screen.getByText('LOADING ......')).toBeInTheDocument();

		// after some time, the todo list should be received
		expect(await screen.findByText('todo 1')).toBeInTheDocument();
		expect(await screen.findByText('todo 2')).toBeInTheDocument();
		expect(await screen.findByText('todo 3')).toBeInTheDocument();
		expect(
			await screen.findByText('Total complete items: 2')
		).toBeInTheDocument();
	});
	test('fetches & receives no todo list', async () => {
		server.use(
			rest.get('http://localhost:7000/todos', (req, res, ctx) => {
				return res(ctx.delay(150), ctx.json([]));
			})
		);
		render(<App />);

		expect(screen.getByText('LOADING ......')).toBeInTheDocument();

		expect(
			await screen.findByText('NO TODO LIST SO FAR .....')
		).toBeInTheDocument();
		expect(
			await screen.findByText('Total complete items: 0')
		).toBeInTheDocument();
	});
	test('fetches & encounter an error', async () => {
		server.use(
			rest.get('http://localhost:7000/todos', (req, res, ctx) => {
				return res(ctx.delay(150), ctx.status(404));
			})
		);
		render(<App />);

		expect(screen.getByText('LOADING ......')).toBeInTheDocument();

		expect(
			await screen.findByText('something is wrong, please try again....')
		).toBeInTheDocument();
		expect(
			await screen.findByText('Total complete items: 0')
		).toBeInTheDocument();
	});

	test('should render a todo item and cannot be toggled due to error', async () => {
		render(<App />);

		server.use(
			rest.patch('http://localhost:7000/todos/1', (req, res, ctx) => {
				return res(ctx.delay(150), ctx.status(404));
			})
		);
		expect(screen.getByText('LOADING ......')).toBeInTheDocument();

		expect(await screen.findByText('todo 1')).toBeInTheDocument();
		expect(await screen.findByText('todo 2')).toBeInTheDocument();
		expect(await screen.findByText('todo 3')).toBeInTheDocument();
		expect(
			await screen.findByText('Total complete items: 2')
		).toBeInTheDocument();
		const checkBox = screen.getAllByRole('checkbox')[0];
		expect(checkBox).toBeChecked();
		userEvent.click(checkBox);
		expect(
			await screen.findByText(
				'(cannot toggle the todo item right now, something is wrong ....)'
			)
		).toBeInTheDocument();
		// expect(checkBox).toBeChecked();
	});

	test('should render todo list and delete a todo item successfully', async () => {
		render(<App />);

		expect(screen.getByText('LOADING ......')).toBeInTheDocument();

		expect(await screen.findByText('todo 1')).toBeInTheDocument();
		expect(await screen.findByText('todo 2')).toBeInTheDocument();
		expect(await screen.findByText('todo 3')).toBeInTheDocument();
		expect(
			await screen.findByText('Total complete items: 2')
		).toBeInTheDocument();
		const deleteButton = screen.getAllByText('Delete')[0];
		userEvent.click(deleteButton);
		expect(await screen.findByText('todo 2')).toBeInTheDocument();
		expect(await screen.findByText('todo 3')).toBeInTheDocument();
		expect(
			await screen.findByText('Total complete items: 1')
		).toBeInTheDocument();
	});

	test('should render todo list and cannot delete a todo item due to error', async () => {
		render(<App />);
		server.use(
			rest.delete('http://localhost:7000/todos/1', (req, res, ctx) => {
				return res(ctx.delay(150), ctx.status(404));
			})
		);

		expect(screen.getByText('LOADING ......')).toBeInTheDocument();

		expect(await screen.findByText('todo 1')).toBeInTheDocument();
		expect(await screen.findByText('todo 2')).toBeInTheDocument();
		expect(await screen.findByText('todo 3')).toBeInTheDocument();
		expect(
			await screen.findByText('Total complete items: 2')
		).toBeInTheDocument();
		const deleteButton = screen.getAllByText('Delete')[0];
		userEvent.click(deleteButton);
		expect(await screen.findByText('todo 1')).toBeInTheDocument();
		expect(await screen.findByText('todo 2')).toBeInTheDocument();
		expect(await screen.findByText('todo 3')).toBeInTheDocument();
		expect(
			await screen.findByText(
				'(cannot delete the todo item right now, something is wrong ....)'
			)
		).toBeInTheDocument();
		expect(
			await screen.findByText('Total complete items: 2')
		).toBeInTheDocument();
	});
});

describe('should render AddToDoForm', () => {
	test('add a todo item successfully', async () => {
		render(<App />);
		userEvent.type(
			screen.getByPlaceholderText('Add todo...'),
			'attend apple event'
		);
		userEvent.click(screen.getByRole('button'));

		expect(screen.getByText('LOADING')).toBeInTheDocument();
		expect(await screen.findByText('attend apple event')).toBeInTheDocument();
	});

	test('add a todo item & encounter an error', async () => {
		server.use(
			rest.post('http://localhost:7000/todos', (req, res, ctx) => {
				return res(ctx.delay(150), ctx.status(404));
			})
		);
		render(<App />);
		userEvent.type(
			screen.getByPlaceholderText('Add todo...'),
			'attend apple event'
		);
		userEvent.click(screen.getByRole('button'));

		expect(screen.getByText('LOADING')).toBeInTheDocument();
		expect(
			await screen.findByText(
				'cannot add a todo right now, something is wrong ....'
			)
		).toBeInTheDocument();
	});
});
