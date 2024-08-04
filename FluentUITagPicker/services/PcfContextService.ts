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
  targetEntityName: string;
  targetEntityId: string;
  relatedEntityName : string;
  relationshipName : string;
  viewid : string;
  showRecordImage:boolean;
  
  

  constructor (props?:IPcfContextServiceProps) {
    if (props) {
      this.instanceid = props.instanceid
      this.dataset = props.context.parameters.tagsDataSet
      this.context = props.context
      this.targetEntityName = (<any>this.context.mode).contextInfo.entityTypeName
      this.targetEntityId   = (<any>this.context.mode).contextInfo.entityId
      this.relatedEntityName = props.context.parameters.tagsDataSet.getTargetEntityType()
      this.relationshipName = (<any>this.context).navigation._customControlProperties.descriptor.Parameters.RelationshipName
      this.viewid = (this.context as any).navigation._customControlProperties.descriptor.Parameters.ViewId
      this.showRecordImage = props.context.parameters.showRecordImage.raw === 'true'

      // console.log(this.targetEntityName)
      // console.log(this.targetEntityId)
    }
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


  async getDatsetViewRecords (entityname:string, primaryid:string, primaryname:string, primaryimage:string, fetchxml:string, metadata:ComponentFramework.PropertyHelper.EntityMetadata) : Promise<ComponentFramework.WebApi.Entity[]> {
    const parser = new DOMParser()
    const fetchxmldoc = parser.parseFromString(fetchxml, 'text/xml')

    // Manipulate fetch xml to include only the fields we need
    const entityelement = fetchxmldoc.getElementsByTagName('entity')[0]

    // remove existing attributes from view fetchxml
    fetchxmldoc.querySelectorAll('attribute').forEach(el => el.remove())
    fetchxmldoc.querySelectorAll('link-entity[alias="dependent"]').forEach(el => el.remove())

    const attributes:string[] = [primaryid, primaryname] // primaryid and primaryname is always fetched

    // add primaryimage if needed
    if (this.showRecordImage) {
      attributes.push(primaryimage)
    }


    // add attributes to fetchxml
    attributes.forEach(attribute => {
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

      return record[`${primaryname}`]

  }

  async associateRecord (targetEntity:string, targetEntityId:string, relatedEntity:string, relatedEntityId:string, relationshipName:string):Promise<void> {
    const associateRequest = {
      target: { entityType: targetEntity, id: targetEntityId },
      relatedEntities: [
          { entityType: relatedEntity, id: relatedEntityId }
      ],
      relationship: relationshipName,
      getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Associate" }; }
    };

    const response = await (<any>this.context.webAPI).execute(associateRequest)
    return response
  }

  async disAssociateRecord (targetEntity:string, targetEntityId:string, relatedEntityId:string, relationshipName:string):Promise<void> {
    const disassociateRequest = {
      target: { entityType: targetEntity, id: targetEntityId },
      relatedEntityId : relatedEntityId,
      relationship: relationshipName,
      getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Disassociate" }; }
    };

    const response = await (<any>this.context.webAPI).execute(disassociateRequest)
    return response
  }
}

