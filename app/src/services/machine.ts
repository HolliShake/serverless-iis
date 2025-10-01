import api from "./api";
import type { MachineState } from "@/types";

const MachineService = new (class {

    async getMachineState(): Promise<MachineState> {
        return await api.get("machine/info")
            .then(x => x.data);
    }

    async getMachineProcesses(): Promise<string[]> {
        return await api.get("machine/process")
            .then(x => x.data);
    }

});

export default MachineService;
