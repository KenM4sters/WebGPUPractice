import Program from "./Program";


async function Main() : Promise<void>
{
    const program = new Program();
    await program.QueryForDevice();
    program.Run();
}

Main();