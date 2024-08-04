import { IInputs, IOutputs } from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;
import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';
import { IPcfContextServiceProps } from "./services/PcfContextService";
import { v4 as uuidv4 } from 'uuid';
import FluentUITagPickerApp from "./components/FluentUITagPickerApp";


export class FluentUITagPicker implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _root: Root;
    private _props:IPcfContextServiceProps;

    /**
     * Empty constructor.
     */
    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void
    {
        this._root = createRoot(container!);


        this._props = {
            context: context,
            instanceid: uuidv4(),
            isDarkMode: context.fluentDesignLanguage?.isDarkTheme ?? false,
        }

    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        // ref : https://www.inogic.com/blog/2019/09/get-all-the-records-of-dataset-grid-control-swiftly
        if (!context.parameters.tagsDataSet.loading) {

            if (context.parameters.tagsDataSet.paging != null && context.parameters.tagsDataSet.paging.hasNextPage == true) {
            
                //set page size
                context.parameters.tagsDataSet.paging.setPageSize(5000);
            
                //load next paging -> will call updateView again
                context.parameters.tagsDataSet.paging.loadNextPage();
            
            } 
            else 
            {
                //console.log('index.ts: main rendering...')
                //Render when all records are loaded
                this._props.context = context
                this._props.instanceid = uuidv4() // refresh the instance id to force update tag picker data when the dataset is refreshed
                this._root.render(createElement(FluentUITagPickerApp, this._props))
            
            }
            
        }
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs
    {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
    }
}
