// client/app/components/DynamicField.jsx
"use client";

import { Controller, useWatch } from 'react-hook-form'; 
import Select from 'react-select';
import { Country, State, City } from 'country-state-city';

export const DynamicField = ({ field, fieldName, control, register, error, setValue, isReadOnly = false }) => {
    const { name, label, type, required, options } = field;

    if (name === 'email' || name === 'mobile') return null;

    const baseInputClasses = `mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400`;
    const readOnlyClasses = isReadOnly ? 'bg-gray-100 cursor-not-allowed' : '';
    const commonBaseProps = { id: fieldName, className: `${baseInputClasses} ${readOnlyClasses}`, readOnly: isReadOnly };

    // --- Location Logic: Auto-detect parent fields ---
    // If fieldName is "users.0.state", we watch "users.0.country"
    // If fieldName is "state", we watch "country"
    const parts = fieldName.split('.');
    const prefix = parts.length > 1 ? parts.slice(0, -1).join('.') + '.' : '';

    const countryFieldName = `${prefix}country`;
    const stateFieldName = `${prefix}state`;
    const cityFieldName = `${prefix}city`;

    // useWatch subscribes to the form state in real-time
    const selectedCountry = useWatch({ control, name: countryFieldName });
    const selectedState = useWatch({ control, name: stateFieldName });

    const renderField = () => {
        switch (type) {
            case 'Text': return <input type="text" {...commonBaseProps} {...register(fieldName, { required: required && `${label} is required` })} />;
            case 'Email': return <input type="email" {...commonBaseProps} {...register(fieldName, { required: required && `${label} is required` })} />;
            case 'Number': return <input type="number" {...commonBaseProps} {...register(fieldName, { required: required && `${label} is required` })} />;
            case 'Date': return <input type="date" {...commonBaseProps} {...register(fieldName, { required: required && `${label} is required` })} />;
            case 'Phone': return null;

            // --- COUNTRY ---
            case 'Country':
                const countryOptions = Country.getAllCountries().map(c => ({ label: c.name, value: c.isoCode }));
                return (
                    <Controller name={fieldName} control={control} rules={{ required: required && `${label} is required` }}
                        render={({ field: controllerField }) => (
                            <Select 
                                {...controllerField} 
                                options={countryOptions} 
                                value={countryOptions.find(c => c.value === controllerField.value) || null}
                                onChange={(val) => {
                                    controllerField.onChange(val ? val.value : null);
                                    if (setValue) {
                                        setValue(stateFieldName, null); // Reset State
                                        setValue(cityFieldName, null);  // Reset City
                                    }
                                }}
                                className="mt-1 text-gray-900" classNamePrefix="react-select" isDisabled={isReadOnly} placeholder="Select Country..."
                            />
                        )}
                    />
                );

            // --- STATE ---
            case 'State':
                const stateOptions = selectedCountry ? State.getStatesOfCountry(selectedCountry).map(s => ({ label: s.name, value: s.isoCode })) : [];
                return (
                    <Controller name={fieldName} control={control} rules={{ required: required && `${label} is required` }}
                        render={({ field: controllerField }) => (
                            <Select 
                                {...controllerField} 
                                options={stateOptions}
                                value={stateOptions.find(s => s.value === controllerField.value) || null}
                                onChange={(val) => {
                                    controllerField.onChange(val ? val.value : null);
                                    if (setValue) setValue(cityFieldName, null); // Reset City
                                }}
                                isDisabled={isReadOnly || !selectedCountry} 
                                className="mt-1 text-gray-900" classNamePrefix="react-select" 
                                placeholder={selectedCountry ? "Select State..." : "Select Country first"}
                                noOptionsMessage={() => "No states found"}
                            />
                        )}
                    />
                );

            // --- CITY ---
            case 'City':
                const cityOptions = (selectedCountry && selectedState) ? City.getCitiesOfState(selectedCountry, selectedState).map(c => ({ label: c.name, value: c.name })) : [];
                return (
                    <Controller name={fieldName} control={control} rules={{ required: required && `${label} is required` }}
                        render={({ field: controllerField }) => (
                            <Select 
                                {...controllerField} 
                                options={cityOptions}
                                value={cityOptions.find(c => c.value === controllerField.value) || null}
                                onChange={(val) => controllerField.onChange(val ? val.value : null)}
                                isDisabled={isReadOnly || !selectedState} 
                                className="mt-1 text-gray-900" classNamePrefix="react-select" 
                                placeholder={selectedState ? "Select City..." : "Select State first"}
                                noOptionsMessage={() => "No cities found"}
                            />
                        )}
                    />
                );

            case 'Radio':
                return (
                    <div className="mt-2 space-y-1 text-gray-900">
                        {(options || []).map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                                <input type="radio" value={opt} {...register(fieldName, { required: required && `${label} is required` })} disabled={isReadOnly} /> {opt}
                            </label>
                        ))}
                    </div>
                );
            case 'Checkbox':
                 return (
                    <div className="mt-2 space-y-1 text-gray-900">
                        {(options || []).map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                                <input type="checkbox" value={opt} {...register(fieldName)} disabled={isReadOnly} /> {opt}
                            </label>
                        ))}
                    </div>
                );
            default: return <input type="text" {...commonBaseProps} {...register(fieldName, { required: required && `${label} is required` })} />;
        }
    };

    return (
        <div className={`w-full ${type === 'Checkbox' || type === 'Radio' ? 'sm:col-span-2' : ''}`}>
            {/* Explicit Label Rendering */}
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {renderField()}
            {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
        </div>
    );
};