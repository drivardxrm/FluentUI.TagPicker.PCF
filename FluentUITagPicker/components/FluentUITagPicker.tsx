import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { usePcfContext } from '../services/PcfContext'
import { Image, Spinner, Tag, TagPicker, TagPickerControl, TagPickerGroup, TagPickerInput, TagPickerList, TagPickerOption, TagPickerProps, useTagPickerFilter } from '@fluentui/react-components'
import { ChevronDown20Regular } from '@fluentui/react-icons';
import { useStyles } from '../styles/Styles'
import { useTagPickerOptions } from '../hooks/useRecords';

const FluentUITagPicker = ():JSX.Element => {
  const pcfcontext = usePcfContext()
  const { options, status, isFetching} = useTagPickerOptions()
  const [query, setQuery] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>(pcfcontext.context.parameters.tagsDataSet.sortedRecordIds);
  const [commitedOptions, seComitedOptions] = React.useState<string[]>(pcfcontext.context.parameters.tagsDataSet.sortedRecordIds);
  const [isFocused, setIsFocused] = useState(false);
  const styles = useStyles()


  const placeholder = useMemo(
    () => selectedOptions.length === 0 ? '---' : '',
    [selectedOptions]
  );

  const handleBlur = () => {
    setQuery('')
  };

  const handleOnChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)    
  };

  const onOptionSelect: TagPickerProps["onOptionSelect"] = (e, data) => {
    if (data.value === 'no-matches') {
      setQuery('')
      return
    }
    setSelectedOptions(data.selectedOptions)
    setQuery('')
  };

  useEffect(
    () => {
        if (selectedOptions !== commitedOptions) {
            const optionsToAssociate = selectedOptions.filter(option => !commitedOptions.includes(option));
            optionsToAssociate.forEach(option => {
                pcfcontext.associateRecord(pcfcontext.targetEntityName, pcfcontext.targetEntityId, pcfcontext.relatedEntityName, option, pcfcontext.relationshipName)
            })

            const optionsToDissacociate = commitedOptions.filter(option => !selectedOptions.includes(option));
            optionsToDissacociate.forEach(option => {
                pcfcontext.disAssociateRecord(pcfcontext.targetEntityName, pcfcontext.targetEntityId, option, pcfcontext.relationshipName)
            })
            seComitedOptions(selectedOptions)
        }
    }
    , [selectedOptions])

  const children = useTagPickerFilter({
    query,
    options: options.map((option) => option.id),
    noOptionsElement: (
      <TagPickerOption value="no-matches">
        {pcfcontext.context.resources.getString('**no match**') || '**no match**'}
      </TagPickerOption>
    ),
    renderOption: (optionidToRender) => (
      <TagPickerOption
        className={styles.tagPickerOption}
        media={
          options.find((option) => option.id === optionidToRender)?.imagesrc &&
            <Image
                className={styles.tagPickerOption}
                alt={options.find((option) => option.id === optionidToRender)?.displaytext}
                key={options.find((option) => option.id === optionidToRender)?.id}
                shape="square"
                src={options.find((option) => option.id === optionidToRender)?.imagesrc}
                height={24}
                //width={25}
            />
        }
        text={options.find((option) => option.id === optionidToRender)?.displaytext ?? ''}
        value={optionidToRender}
        key={optionidToRender}
      >
         {options.find((option) => option.id === optionidToRender)?.displaytext}
      </TagPickerOption>
    ),

    filter: (option) =>
      !selectedOptions.includes(option) &&
      (options.find((o) => o.id === option)?.displaytext.toLowerCase().includes(query.toLowerCase()) ?? false)
  });

  

  // MAIN RENDERING
  if (status === 'pending' || isFetching) {
    return <Spinner size='tiny' appearance='primary' label={pcfcontext.context.resources.getString('Loading...') || 'Loading...'} />
  } if (status === 'error') {
    return <div>{pcfcontext.context.resources.getString('Error fetching data...') || 'Error fetching data...'}</div>
  } else {
    return (
      <div className={styles.tagPickerContainer}>
        {options && (
          <TagPicker
            onOptionSelect={onOptionSelect}
            selectedOptions={selectedOptions}
            appearance={'filled-darker'}
          >
            <TagPickerControl 
              className={styles.tagPickerControl}
              onMouseEnter={()=>{setIsFocused(true)}} 
              onMouseLeave={()=>{setIsFocused(false)}}
              expandIcon={<ChevronDown20Regular className={isFocused ? styles.elementVisible : styles.elementHidden}/>}
            >
        
                <TagPickerGroup 
                    className={styles.tagPickerGroup}
                >
                    {selectedOptions.map((optionToRender) => (
                        <Tag
                            key={optionToRender}
                            className={styles.tag}
                            shape={'rounded'}
                            size={'medium'}
                            appearance={'brand'} // todo parametrize
                            media={
                                options.find((option) => option.id === optionToRender)?.imagesrc &&
                                <Image
                                    alt={options.find((option) => option.id === optionToRender)?.displaytext}
                                    key={options.find((option) => option.id === optionToRender)?.id}
                                    shape="square"
                                    src={options.find((option) => option.id === optionToRender)?.imagesrc}
                                    height={24}
                                />
                            
                            }
                            value={optionToRender}
                            title={options.find((option) => option.id === optionToRender)?.displaytext}
                            primaryText={{className: styles.tagOverflow }}
                            >
                            {options.find((option) => option.id === optionToRender)?.displaytext}
                        </Tag>
                    ))}
                    
                </TagPickerGroup>
             
    
                <TagPickerInput 
                    className={styles.tagPickerInput}
                    //aria-label={pcfcontext.SelectText()}
                    placeholder={placeholder}
                    value={query}
                    onChange={handleOnChange} 
                    onBlur={handleBlur}
                    clearable={true}
                />
            </TagPickerControl>
            <TagPickerList>
              {children}
            </TagPickerList>
          </TagPicker>
        )}
      </div>
    )
  }
}

export default FluentUITagPicker