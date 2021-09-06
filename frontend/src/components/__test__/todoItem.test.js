import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen } from '../../test/test-utils';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import TodoItem from '../TodoItem';

export const handlers = [
	rest.patch('http://localhost:7000/todos/10', (req, res, ctx) => {
		return res(
			ctx.json([
				{
					id: 1,
					title: 'non-completed item will be toggled to be completed',
					completed: true,
				},
			]),
			ctx.delay(150)
		);
	}),
	// rest.post('http://localhost:7000/todos', (req, res, ctx) => {
	// 	return res(
	// 		ctx.json({
	// 			id: 4,
	// 			title: 'attend apple event',
	// 			completed: false,
	// 		}),
	// 		ctx.delay(150)
	// 	);
	// }),
];

const server = setupServer(...handlers);

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done.
afterAll(() => server.close());

describe('should render a todo item', () => {
	test('should render a completed todo item', () => {
		const todoItem = {
			id: 10,
			title: 'completed todo item',
			completed: true,
		};

		render(
			<TodoItem
				id={todoItem.id}
				title={todoItem.title}
				completed={todoItem.completed}
			/>
		);

		const todoElement = screen.getByText('completed todo item');
		expect(todoElement).toBeInTheDocument();
		const checkBox = screen.getByRole('checkbox');
		expect(checkBox).toBeChecked();
	});

	test('should render a non-completed todo item', () => {
		const todoItem = {
			id: 1,
			title: 'non-completed todo item',
			completed: false,
		};

		render(
			<TodoItem
				id={todoItem.id}
				title={todoItem.title}
				completed={todoItem.completed}
			/>
		);

		const todoElement = screen.getByText('non-completed todo item');
		expect(todoElement).toBeInTheDocument();
		const checkBox = screen.getByRole('checkbox');
		expect(checkBox).not.toBeChecked();
	});
	test('should render a non-completed todo item and toggle it to be completed', async () => {
		const todoItem = {
			id: 10,
			title: 'non-completed item will be toggled to be completed',
			completed: false,
		};

		render(
			<TodoItem
				id={todoItem.id}
				title={todoItem.title}
				completed={todoItem.completed}
			/>
		);

		const todoElement = screen.getByText(
			'non-completed item will be toggled to be completed'
		);
		expect(todoElement).toBeInTheDocument();
		const checkBox = screen.getByRole('checkbox');
		expect(checkBox).not.toBeChecked();
		userEvent.click(screen.getByRole('checkbox'));
		expect(screen.getByRole('checkbox')).toBeChecked();
	});

	test('should render a completed todo item and toggle it to be non-completed', async () => {
		const todoItem = {
			id: 10,
			title: 'completed item will be toggled to be non-completed',
			completed: true,
		};

		render(
			<TodoItem
				id={todoItem.id}
				title={todoItem.title}
				completed={todoItem.completed}
			/>
		);

		const todoElement = screen.getByText(
			'completed item will be toggled to be non-completed'
		);
		expect(todoElement).toBeInTheDocument();
		const checkBox = screen.getByRole('checkbox');
		expect(checkBox).toBeChecked();
		userEvent.click(screen.getByRole('checkbox'));
		expect(screen.getByRole('checkbox')).not.toBeChecked();
	});
});
