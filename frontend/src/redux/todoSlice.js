import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import axios from 'axios';

export const getTodosAsync = createAsyncThunk(
	'todos/getTodosAsync',

	async () => {
		let resp = null;

		try {
			resp = await axios.get('http://localhost:7000/todos');
			return resp.data;
		} catch (err) {
			// console.log('something is wrong in the get');
			// return [];
			throw new Error('something is wrong, please try again....');
		}
	}
);

export const addTodoAsync = createAsyncThunk(
	'todos/addTodoAsync',
	async (payload) => {
		let resp = null;

		try {
			resp = await axios.post('http://localhost:7000/todos', {
				title: payload.title,
			});
			return resp.data;
		} catch (err) {
			throw new Error('cannot add a todo right now, something is wrong ....');
		}
	}
);

export const toggleCompleteAsync = createAsyncThunk(
	'todos/completeTodoAsync',
	async (payload) => {
		let resp = null;

		try {
			resp = await axios.patch(`http://localhost:7000/todos/${payload.id}`, {
				completed: payload.completed,
			});
			// console.log('this is resp: ', resp)
			return resp.data;
		} catch (err) {
			throw new Error(
				'cannot toggle the todo item right now, something is wrong ....',
				{
					id: payload.id,
				}
			);
		}
	}
);

export const deleteTodoAsync = createAsyncThunk(
	'todos/deleteTodoAsync',
	async (payload) => {
		let resp = null;

		try {
			resp = await axios.delete(`http://localhost:7000/todos/${payload.id}`, {
				completed: payload.completed,
			});
			return resp.data;
		} catch (err) {
			throw new Error(
				'cannot delete the todo item right now, something is wrong ....',
				{
					id: payload.id,
				}
			);
		}
	}
);

export const todoSlice = createSlice({
	name: 'todos',
	initialState: {
		todoList: [],
		todoListStatus: true,
		statusMessage: '',
		addTodoStatus: false,
		addTodoListStatusMessage: '',
		toggleCompleteMessage: '',
	},
	reducers: {
		addTodo: (state, action) => {
			const todo = {
				id: nanoid(),
				title: action.payload.title,
				completed: false,
			};
			state.push(todo);
		},
		toggleComplete: (state, action) => {
			const index = state.findIndex((todo) => todo.id === action.payload.id);
			state[index].completed = action.payload.completed;
		},
		deleteTodo: (state, action) => {
			return state.filter((todo) => todo.id !== action.payload.id);
		},
	},
	extraReducers: {
		[getTodosAsync.pending]: (state, action) => {
			state.todoListStatus = true;
		},

		[getTodosAsync.fulfilled]: (state, action) => {
			state.todoListStatus = false;
			if (action.payload.length > 0) {
				state.todoList = action.payload;
				state.statusMessage = '';
			} else {
				state.statusMessage = 'NO TODO LIST SO FAR .....';
			}
		},

		[getTodosAsync.rejected]: (state, action) => {
			state.todoListStatus = false;
			state.statusMessage = action.error.message;
		},

		[addTodoAsync.pending]: (state, action) => {
			state.addTodoStatus = true;
		},

		[addTodoAsync.fulfilled]: (state, action) => {
			state.addTodoStatus = false;

			state.todoList.push(action.payload);
			state.addTodoListStatusMessage = `${action.payload.title} added successfully`;
		},

		[addTodoAsync.rejected]: (state, action) => {
			state.addTodoStatus = false;
			state.addTodoListStatusMessage = action.error.message;
		},

		[toggleCompleteAsync.fulfilled]: (state, action) => {
			const index = state.todoList.findIndex(
				(todo) => todo.id === action.payload.id
			);
			state.todoList[index].completed = action.payload.completed;
		},
		[toggleCompleteAsync.rejected]: (state, action) => {
			// console.log('something is wrong.... and this is action: ', action);
			const index = state.todoList.findIndex(
				(todo) => todo.id === action.meta.arg.id
			);
			state.todoList[index].message = action.error.message;
		},

		[deleteTodoAsync.fulfilled]: (state, action) => {
			// return state.todoList.filter((todo) => todo.id !== action.payload.id);
			// console.log('this is fulfilled delete: ', action);
			state.todoList = [...action.payload];
		},
		[deleteTodoAsync.rejected]: (state, action) => {
			// return state.todoList.filter((todo) => todo.id !== action.payload.id);
			const index = state.todoList.findIndex(
				(todo) => todo.id === action.meta.arg.id
			);
			state.todoList[index].message = action.error.message;
		},
	},
});

export const { addTodo, toggleComplete, deleteTodo } = todoSlice.actions;

export default todoSlice.reducer;
