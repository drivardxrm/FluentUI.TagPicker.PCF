import { Theme } from '@fluentui/react-components';
import { IInputs } from '../generated/ManifestTypes'

//https://www.inogic.com/blog/2020/12/get-subgrid-information-from-the-pcf-context/

export interface IPcfContextServiceProps{
  context: ComponentFramework.Context<IInputs>;
  instanceid: string;
  isDarkMode: boolean;
}

export interface iTagInfo{
  id: string;
  name: string;
}

export class PcfContextService {
  instanceid:string;
  dataset : ComponentFramework.PropertyTypes.DataSet;
  context: ComponentFramework.Context<IInputs>;
  entityname : string;
  relationshipname : string;
  viewid : string;
  showRecordImage:boolean;
  
  

  constructor (props?:IPcfContextServiceProps) {
    if (props) {
      this.instanceid = props.instanceid
      this.entityname = props.context.parameters.tagsDataSet.getTargetEntityType()
      this.context = props.context
      this.dataset = props.context.parameters.tagsDataSet
      this.showRecordImage = props.context.parameters.showRecordImage.raw === 'true'

      this.relationshipname = (this.context as any).navigation._customControlProperties.descriptor.Parameters.RelationshipName
      this.viewid = (this.context as any).navigation._customControlProperties.descriptor.Parameters.ViewId
    }
  }


  
  tagValues():iTagInfo[] {
    return this.dataset?.sortedRecordIds.map((recordId) => {
      const currentRecord = this.dataset?.records[recordId]  
      return {
        id: recordId ?? '',
        name: currentRecord?.getFormattedValue('tagLabel') ?? '',
      }
    }) ?? []
  }


  async getEntityMetadata (entityname:string) : Promise<ComponentFramework.PropertyHelper.EntityMetadata> {
    return this.context.utils.getEntityMetadata(entityname)
  }

  async getRecordImage (entityType:string, id:string, primaryimage:string) : Promise<string> {

    const record = await this.context.webAPI.retrieveRecord(entityType,id,`?$select=${primaryimage}`)
    return  record?.[primaryimage]
            ? `data:image/jpeg;base64,${record?.[primaryimage]}`
            : ''
  }

  async getDatasetView () : Promise<ComponentFramework.WebApi.Entity> {
    return await this.context.webAPI
      .retrieveRecord('savedquery', this.viewid, '?$select=returnedtypecode,fetchxml')
  }

  // Returns all strings between curly braces in custom text
  // CustomTextAttributes ():string[] {
  //   // eslint-disable-next-line no-useless-escape
  //   return this.context.parameters.customtext.raw?.match(/[^{\}]+(?=})/g) ?? []
  // }

   // Get the list of fields to fetch
   getAttributes (primaryid:string, primaryname:string, primaryimage:string):string[] {
    const attributes:string[] = [primaryid, primaryname] // primaryid and primaryname is always fetched

    // add custom text attributes if needed
    // this.CustomTextAttributes().forEach(attribute => {
    //   if (!attributes.includes(attribute)) {
    //     attributes.push(attribute)
    //   }
    // })

    // add primaryimage if needed
    if (this.showRecordImage) {
      attributes.push(primaryimage)
    }
    return attributes
  }

  async getDatsetViewRecords (entityname:string, primaryid:string, primaryname:string, primaryimage:string, fetchxml:string, metadata:ComponentFramework.PropertyHelper.EntityMetadata) : Promise<ComponentFramework.WebApi.Entity[]> {
    const parser = new DOMParser()
    const fetchxmldoc = parser.parseFromString(fetchxml, 'text/xml')

    // Manipulate fetch xml to include only the fields we need
    const entityelement = fetchxmldoc.getElementsByTagName('entity')[0]

    // remove existing attributes from view fetchxml
    fetchxmldoc.querySelectorAll('attribute').forEach(el => el.remove())
    fetchxmldoc.querySelectorAll('link-entity[alias="dependent"]').forEach(el => el.remove())

    // add attributes to fetchxml
    this.getAttributes(primaryid, primaryname, primaryimage).forEach(attribute => {
      const customattribute = fetchxmldoc.createElement('attribute')
      customattribute.setAttribute('name', attribute)
      entityelement.appendChild(customattribute)
    })

    
    const fetchxmlstring = new XMLSerializer().serializeToString(fetchxmldoc)
    const result = await this.context.webAPI
      .retrieveMultipleRecords(entityname, `?fetchXml=${fetchxmlstring}`)

    
    return result.entities;

  }

  getRecordText (record:ComponentFramework.WebApi.Entity, primaryname:string):string {
    // Default = record primaryname
    //if (!this.customText) {
      return record[`${primaryname}`]
    // } else {
    //   // Custom text
    //   let customtext = this.customText;
    //     this.CustomTextAttributes().forEach(attribute => {
    //       // check if there is a formated value for the attribute (ex. Choice, Date, Lookup etc)
    //       const formatedValue = record[`${attribute}@OData.Community.Display.V1.FormattedValue`] ??
    //                             record[`_${attribute}_value@OData.Community.Display.V1.FormattedValue`] ??
    //                             record[`${attribute}`]
    //       customtext = this.replaceAll(customtext!, `{${attribute}}`, formatedValue ?? '')
    //     })
  
    //     return customtext
    // }
  }

  // async openRecord (entityName:string,entityId:string):Promise<ComponentFramework.NavigationApi.OpenFormSuccessResponse> {
  //   return this.context.navigation.openForm(
  //     {
  //       entityName: entityName,
  //       entityId: entityId
  //     }
  //   )
  // }
}
