
const textAnalyzer = () => {
	const watcher = (elementID, error) => {

		document.getElementById(elementID).addEventListener('focus', (e) => {

			let errors = document.querySelectorAll(`#${error}`);
			errors.forEach((e) => e.remove());
		});
	};

	const errorTip = (element, text) => {
		let error = document.createElement('div');
		error.id = `error-${element.id}`;
		error.className = 'error';
		error.style.color = '#8B0000';
		error.style.fontSize = '12px';
		element.insertAdjacentElement('afterend', error);
		error.innerHTML = text;

		watcher(element.id, error.id);
	};

	const checkString = (strVal, varName, conditions) => {
		let str = strVal.value;
		let a = 0;
		if (!str) {
			let text = `Error: You must provide ${varName}`;
			errorTip(strVal, text);
			a = a + 1;
		}

		if (typeof str !== 'string') {
			let text = `Error: ${varName} must be a string!`;
			errorTip(strVal, text);
			a = a + 1;
		}

		str = str.trim();
		if (str.length === 0) {
			let text = `Error: ${varName} cannot be an empty string or string with just spaces`;
			errorTip(strVal, text);
			a = a + 1;
		}

		if (conditions) {
			let key = Object.keys(conditions);
			let value = Object.values(conditions);
			key.map((item, index) => {
				if (item === 'max') {
					if (str.length > value[index]) {
						text = `Error: ${varName} must be less than ${value[index]} characters`;
						errorTip(strVal, text);
						a = a + 1;
					}
				}
				if (item === 'min') {
					if (str.length < value[index]) {
						text = `Error: ${varName} must be more than ${value[index]} characters`;
						errorTip(strVal, text);
						a = a + 1;
					}
				}
			});
		}
		if (a >= 1) {
			return false;
		}
		return true;
	};

	const reviewSubmitValidation = (e, reviewSubmitButton) => {
		// let firstName = document.getElementById('firstName');
		// let lastName = document.getElementById('lastName');
		// let username = document.getElementById('username');
		// let password = document.getElementById('password');
		// let confirmPassword = document.getElementById('confirmPassword');
		// let favoriteQuote = document.getElementById('favoriteQuote');
		// let themePreference = document.getElementById('themePreference');
		// let role = document.getElementById('role');

		// checkString(firstName, 'firstName', { min: '2', max: '25' });
		// validateName(firstName, 'firstName');

		// checkString(lastName, 'lastName', { min: '2', max: '25' });
		// validateName(lastName, 'lastName');

		// checkString(username, 'username', { min: '5', max: '10' });
		// validateName(username, 'username');

		// checkString(password, 'password', { min: '8' });
		// checkString(confirmPassword, 'confirmPassword');
		// validatePassword(password, confirmPassword);

		// checkString(favoriteQuote, 'favoriteQuote', { min: '20', max: '255' });

		// checkSelection(themePreference, 'themePreference', ['light', 'dark']);
		// checkSelection(role, 'role', ['admin', 'user']);

		// let err = document.querySelectorAll('.error');
		// if (!err || err.length === 0) {
		// 	check = true;
		// } else {
		// 	check = false;
		// }

		console.log("btn validation");
		let check = true;

		if (check) {
			reviewSubmitButton.setAttribute('type', 'submit');
			console.log("submitted");
		} else {
			reviewSubmitButton.setAttribute('type', 'button');
		}
		return check;
	};

	let reviewSubmitButton = document.getElementById('reviewSubmit');
	if (reviewSubmitButton) {
		document.getElementById('reviewSubmit').addEventListener('click', (e) => {
			let errors = document.querySelectorAll('.error');
			if (errors) {
				errors.forEach((ele) => ele.remove());
			}
			// if (reviewSubmitValidation(e, reviewSubmitButton)) {
      //   e.target.form.submit();  // Submit the form if validation passes
			// } else {
			// 		console.log("Validation failed");
			// }
		});
	}
}

textAnalyzer();