import React, { createContext, useContext, useState } from 'react';
const KundliContext = createContext();

const KundliProvider = ({ children }) => {
	const [name, setName] = useState('');
	const [gender, setGender] = useState('');
	const [birthdate, setBirthdate] = useState(new Date());
	const [birthtime, setBirthtime] = useState(new Date());
	const [birthPlace, setBirthPlace] = useState('');
	const [isModalVisible, setModalVisible] = useState(false);

	const [girlName, setGirlName] = useState('');
	const [girlBirthDate, setGirlBirthDate] = useState(new Date());
	const [girlBirthTime, setGirlBirthTime] = useState(new Date());
	const [girlBirthPlace, setGirlBirthPlace] = useState('');

	const [boyName, setBoyName] = useState('');
	const [boyBirthDate, setBoyBirthDate] = useState(new Date());
	const [boyBirthTime, setBoyBirthTime] = useState(new Date());
	const [boyBirthPlace, setBoyBirthPlace] = useState('');

	return (
		<KundliContext.Provider
			value={{
				name,
				setName,
				birthdate,
				setBirthdate,
				birthtime,
				setBirthtime,
				gender,
				setGender,
				birthPlace,
				setBirthPlace,
				isModalVisible,
				setModalVisible,
				boyName,
				boyBirthDate,
				boyBirthTime,
				boyBirthPlace,
				setBoyName,
				setBoyBirthDate,
				setBoyBirthTime,
				setBoyBirthPlace,
				girlName,
				girlBirthDate,
				girlBirthTime,
				girlBirthPlace,
				setGirlName,
				setGirlBirthDate,
				setGirlBirthTime,
				setGirlBirthPlace,
			}}
		>
			{children}
		</KundliContext.Provider>
	);
};

export const KundliState = () => {
	return useContext(KundliContext);
};

export default KundliProvider;
