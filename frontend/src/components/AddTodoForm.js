import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTodoAsync } from '../redux/todoSlice';

const AddTodoForm = () => {
	const [value, setValue] = useState('');
	const dispatch = useDispatch();
	const addTodoStatus = useSelector((state) => state.todos.addTodoStatus);
	const addTodoListStatusMessage = useSelector(
		(state) => state.todos.addTodoListStatusMessage
	);

	const onSubmit = (event) => {
		event.preventDefault();
		if (value) {
			dispatch(
				addTodoAsync({
					title: value,
				})
			);
			setValue('');
		}
	};

	let textColor = 'red';

	if (addTodoListStatusMessage === `${value} added successfully`) {
		textColor = 'green';
	}

	let content = null;

	if (addTodoStatus === true) {
		content = <h2>LOADING </h2>;
	} else {
		content = (
			<form onSubmit={onSubmit} className='form-inline mt-3 mb-3'>
				<label className='sr-only'>Name</label>
				<input
					type='text'
					className='form-control mb-2 mr-sm-2'
					placeholder='Add todo...'
					value={value}
					onChange={(event) => setValue(event.target.value)}
				></input>

				<button type='submit' className='btn btn-primary mb-2'>
					Submit
				</button>
			</form>
		);
	}

	return (
		<div>
			{content}
			<h3 style={{ color: `${textColor}` }}>{addTodoListStatusMessage}</h3>
		</div>
	);
};

export default AddTodoForm;
