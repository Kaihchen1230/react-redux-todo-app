import React, { useEffect } from 'react';
import TodoItem from './TodoItem';
import { useSelector, useDispatch } from 'react-redux';
import { getTodosAsync } from '../redux/todoSlice';

const TodoList = () => {
	const dispatch = useDispatch();
	const todoList = useSelector((state) => state.todos.todoList);
	const todoListStatus = useSelector((state) => state.todos.todoListStatus);
	const statusMessage = useSelector((state) => state.todos.statusMessage);

	useEffect(() => {
		dispatch(getTodosAsync());
	}, [dispatch]);

	return (
		<div>
			{todoListStatus === true ? (
				<h2>LOADING ......</h2>
			) : (
				<ul className='list-group'>
					{todoList.map((todo) => (
						<TodoItem
							key={todo.id}
							id={todo.id}
							title={todo.title}
							completed={todo.completed}
							message={todo.hasOwnProperty('message') ? todo.message : ''}
						/>
					))}
				</ul>
			)}
			<h2 style={{ color: 'red' }}>{statusMessage}</h2>
		</div>
	);
};

export default TodoList;
